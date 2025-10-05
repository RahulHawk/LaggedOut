const adminOnly = async (req, res, next) => {
    try {
        if (!req.user) return res.status(401).json({ status: false, message: "Unauthorized" });

        await req.user.populate("role", "name");
        if (req.user.role.name !== "admin") {
            return res.status(403).json({ status: false, message: "Admin access only" });
        }

        next();
    } catch (error) {
        console.error("AdminOnly Middleware Error:", error);
        res.status(500).json({ status: false, message: "Server error" });
    }
};

const adminOrDeveloper = async (req, res, next) => {
    try {
        if (!req.user) return res.status(401).json({ status: false, message: "Unauthorized" });

        await req.user.populate("role", "name");
        if (!["admin", "developer"].includes(req.user.role.name)) {
            return res.status(403).json({ status: false, message: "Access restricted to Admin or Developer" });
        }

        next();
    } catch (error) {
        console.error("AdminOrDeveloper Middleware Error:", error);
        res.status(500).json({ status: false, message: "Server error" });
    }
};

module.exports = {
    adminOnly,
    adminOrDeveloper
};
