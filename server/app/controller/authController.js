const { registerValidation, loginValidation } = require("../validations/userValidation");
const Role = require("../model/roleModel");
const User = require("../model/userModel");
const { HashedPassword, comparePassword } = require("../middleware/password");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const EmailVerificationLink = require("../helper/verificationMail");
const ForgotPasswordMail = require("../helper/forgotPasswordMail");
const { addToken } = require("../middleware/blacklistToken");
const { generateCustomId } = require("../helper/customIdGenerator");
const { sendDevRequestReceivedEmail } = require("../helper/devRequestReceivedMail");

class AuthController {
    async register(req, res) {
        try {
            const { error } = registerValidation(req.body);
            if (error) return res.status(400).json({ status: false, message: error.details[0].message });

            const { firstName, lastName, email, password, role: roleInput } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) return res.status(400).json({ status: false, message: "Email already registered" });

            let role;
            if (!roleInput || roleInput === "admin") {
                role = await Role.findOne({ name: "player" });
            } else if (roleInput.length === 24) {
                role = await Role.findById(roleInput);
            } else {
                role = await Role.findOne({ name: roleInput });
            }

            if (!role) return res.status(400).json({ status: false, message: "Invalid role" });

            const hashedPassword = await HashedPassword(password);

            const userId = await generateCustomId(role);

            const newUser = new User({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: role._id,
                userId,
                authProviders: [{ provider: "local" }]
            });
            await newUser.save();

            await EmailVerificationLink(req, newUser);

            const { password: _, ...userWithoutPassword } = newUser.toObject();

            return res.status(200).json({
                status: true,
                message: "User registered successfully. Please verify your email.",
                data: userWithoutPassword
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    async requestDevLink(req, res) {
        try {
            const { email, firstName, lastName } = req.body;

            if (!email || !firstName || !lastName) {
                return res.status(400).json({ status: false, message: "All fields are required" });
            }

            let user = await User.findOne({ email });

            if (user && user.developerRequest?.requestedAt) {
                return res.status(400).json({
                    status: false,
                    message: "You have already requested developer access. Please wait for admin approval."
                });
            }

            const requestToken = crypto.randomBytes(32).toString("hex");

            if (!user) {
                user = new User({
                    firstName,
                    lastName,
                    email,
                    developerRequest: {
                        requestedAt: new Date(),
                        requestToken
                    }
                });
            } else {
                user.developerRequest = {
                    requestedAt: new Date(),
                    requestToken
                };
            }

            await user.save();

            await sendDevRequestReceivedEmail(email, firstName);

            return res.status(200).json({ status: true, message: "Developer request submitted successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async registerDev(req, res) {
        try {
            const { token } = req.query;
            const { password, userName } = req.body;

            if (!token) return res.status(400).json({ status: false, message: "Token is required" });
            if (!password || !userName) return res.status(400).json({ status: false, message: "All fields are required" });

            const user = await User.findOne({ "developerRequest.requestToken": token }).populate("role");

            if (!user) return res.status(404).json({ status: false, message: "Invalid or expired token" });
            if (user.isDeveloperApproved) return res.status(400).json({ status: false, message: "Developer already registered" });

            let devRole = await Role.findOne({ name: "developer" });
            if (!devRole) return res.status(500).json({ status: false, message: "Developer role not found" });

            const hashedPassword = await HashedPassword(password);

            const userId = await generateCustomId(devRole.name);

            user.password = hashedPassword;
            user.userName = userName;
            user.role = devRole._id;
            user.isDeveloperApproved = true;
            user.isEmailVerified = true;
            user.isUsernameSet = true;
            user.userId = userId;
            user.developerRequest.requestToken = undefined;

            await user.save();

            const jwtToken = jwt.sign(
                { id: user._id, role: devRole.name },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            return res.status(200).json({
                status: true,
                message: "Developer registered successfully",
                token: jwtToken,
                user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    userName: user.userName,
                    email: user.email,
                    role: devRole.name,
                    authProviders: [{ provider: "local" }]
                }
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async googleCallback(req, res) {
        try {
            const profile = req.user;
            let user = await User.findOne({ email: profile.email }).populate("role", "name");

            if (user) {
                if (!user.authProviders.some(p => p.provider === "google")) {
                    user.authProviders.push({ provider: "google", providerId: profile.googleId });
                }
                if (!user.role) {
                    const defaultRole = await Role.findOne({ name: "player" });
                    user.role = defaultRole._id;
                }
                await user.save();

            }
            else {
                const role = await Role.findOne({ name: "player" });
                if (!role) throw new Error("Default player role not found");

                const userId = await generateCustomId(role);

                const newUser = new User({
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    email: profile.email,
                    authProviders: [{ provider: "google", providerId: profile.googleId }],
                    role: role._id,
                    userId: profile.userId,
                    'profile.profilePic': profile.avatar,
                    isEmailVerified: true,
                    isUsernameSet: false,
                });

                await newUser.save();
                user = await newUser.populate("role", "name");
            }

            const token = jwt.sign({ id: user._id, role: user.role.name }, process.env.JWT_SECRET, { expiresIn: "7d" });

            const userResponse = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role.name,
                isUsernameSet: user.isUsernameSet,
                userName: user.userName
            };


            res.cookie("token", token, { secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 1000 * 60 * 60 * 24 * 7 });
            res.cookie("user", JSON.stringify(userResponse), { secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 1000 * 60 * 60 * 24 * 7 });

            const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
            let redirectUrl = `${clientUrl}/`;

            if (user.role.name === 'admin') {
                redirectUrl = `${clientUrl}/admin/dashboard?status=login_success`;
            } else if (user.role.name === 'player' && !user.isUsernameSet) {
                redirectUrl = `${clientUrl}/?prompt=username&status=login_success`;
            } else {
                redirectUrl = `${clientUrl}/?status=login_success`;
            }

            return res.redirect(redirectUrl);

        } catch (error) {
            console.error(error);
            const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
            return res.redirect(`${clientUrl}/auth/login?error=google_auth_failed`);
        }
    }

    async verifyEmail(req, res) {
        try {
            const { token } = req.query;
            if (!token) {
                return res.status(400).json({ status: false, message: "Token not found" });
            };
            const user = await User.findOne({
                emailVerificationToken: token,
                emailVerificationExpires: { $gt: Date.now() }
            });
            if (!user) {
                return res.status(404).json({ status: false, message: "Invalid or expired verification token" });
            };

            user.isEmailVerified = true;
            user.emailVerificationToken = undefined;
            user.emailVerificationExpires = undefined;
            await user.save();
            res.status(200).json({
                status: true,
                message: "Email verified successfully. You can now log in."
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async resendVerificationMail(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ status: false, message: "Email is required" });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ status: false, message: "User not found" });
            }

            if (user.isEmailVerified) {
                return res.status(400).json({ status: false, message: "Email already verified" });
            }

            if (
                user.lastVerificationEmailSentAt &&
                new Date() - new Date(user.lastVerificationEmailSentAt) < 60 * 1000
            ) {
                const waitTime = Math.ceil(
                    (60 * 1000 - (new Date() - new Date(user.lastVerificationEmailSentAt))) / 1000
                );
                return res.status(429).json({
                    status: false,
                    message: `Please wait ${waitTime} seconds before requesting another verification email`
                });
            }

            const token = crypto.randomBytes(32).toString("hex");
            user.emailVerificationToken = token;
            user.lastVerificationEmailSentAt = new Date();
            await user.save();

            await EmailVerificationLink(req, user);

            return res.status(200).json({
                status: true,
                message: "Verification email sent successfully"
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ status: false, message: "Email is required" });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ status: false, message: "User not found" });
            }

            await ForgotPasswordMail(req, user);
            res.status(200).json({ status: true, message: "Password reset link sent to your email" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: false, message: error.message });
        }
    }

    async resetPassword(req, res) {
        try {
            const { token } = req.query;
            const { password, confirmPassword } = req.body;
            if (!token) {
                return res.status(400).json({ status: false, message: "Token not found" });
            }

            if (!password || !confirmPassword) {
                return res.status(400).json({ status: false, message: "All fields are required" });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({ status: false, message: "Passwords do not match" });
            }

            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({ status: false, message: "Invalid or expired token" });
            }

            const hashedPassword = await HashedPassword(password);
            user.password = hashedPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            res.status(200).json({ status: true, message: "Password reset successful" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: false, message: error.message });
        }
    }

    async login(req, res) {
        try {
            const { error } = loginValidation(req.body);
            if (error) return res.status(400).json({ status: false, message: error.details[0].message });

            const { email, password } = req.body;

            const user = await User.findOne({ email }).populate("role", "name");
            if (!user) return res.status(400).json({ status: false, message: "User not found" });

            const hasLocal = user.authProviders.some(p => p.provider === "local");
            if (!hasLocal) {
                return res.status(400).json({
                    status: false,
                    message: "This account is linked to Google. Please login via Google or set a password in your profile."
                });
            }

            const isMatch = await comparePassword(password, user.password);
            if (!isMatch) return res.status(400).json({ status: false, message: "Invalid password" });

            if (user.isBanned) {
                return res.status(403).json({
                    status: false,
                    message: "Your account has been banned. Please contact support."
                });
            }

            if (!user.isEmailVerified) {
                await EmailVerificationLink(req, user);
                return res.status(403).json({ status: false, message: "Email not verified. Verification email sent." });
            }

            if (user.role.name === "developer" && !user.isDeveloperApproved) {
                return res.status(403).json({
                    status: false,
                    message: "Your developer account is awaiting admin approval. You cannot log in yet."
                });
            }

            if (user.role.name === "player" && !user.isUsernameSet) {
                const token = jwt.sign(
                    { id: user._id, role: user.role.name },
                    process.env.JWT_SECRET,
                    { expiresIn: "1d" }
                );

                return res.status(200).json({
                    firstTime: true,
                    message: "We recommend setting your username for privacy",
                    user: {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        fullName: `${user.firstName} ${user.lastName}`,
                        displayName: user.userName || user.firstName
                    },
                    token
                });
            }

            const token = jwt.sign(
                { id: user._id, role: user.role.name },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            res.cookie("token", token, {
                httpOnly: true,
                sameSite: "strict",
                path: "/",
                secure: process.env.NODE_ENV === "production",
                maxAge: 24 * 60 * 60 * 1000
            });

            return res.status(200).json({
                status: true,
                message: "Login successful",
                user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: `${user.firstName} ${user.lastName}`,
                    displayName: user.userName || user.firstName,
                    email: user.email,
                    role: user.role.name
                },
                token
            });

        } catch (error) {
            console.error("Login Error:", error);
            return res.status(500).json({ status: false, message: "Internal server error" });
        }
    }

    async logout(req, res) {
        try {
            const token = req.cookies?.token || req.headers["x-access-token"] || req.headers.authorization?.split(" ")[1];

            if (token) {
                const decoded = jwt.decode(token);
                if (decoded?.exp) {
                    addToken(token, decoded.exp * 1000);
                }
            }

            const onlineUsers = req.app.get("onlineUsers");
            if (req.user?.id) onlineUsers.delete(req.user.id);

            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
                path: "/",
                expires: new Date(0)
            });

            return res.status(200).json({ status: true, message: "Logout successful" });

        } catch (error) {
            console.error("Logout Error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

}

module.exports = new AuthController();