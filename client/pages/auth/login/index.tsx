'use client';

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from "@/customHooks/auth.hooks.query";
import { LoginPayload } from "@/typescript/authTypes";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { login as reduxLogin } from "@/redux/slices/authSlice";
import Head from "next/head";

const LoginPage = () => {
  const router = useRouter();
  const { from } = router.query; // Get query params to see if we came from register page
  const dispatch = useDispatch();

  // FIX: Destructure the new resend verification handlers from the useAuth hook
  const { handleLogin, isLoginLoading, loginError, cookies, handleResendVerification, isResendLoading } = useAuth();

  const [form, setForm] = useState<LoginPayload>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  // FIX: State to control the visibility of the "Resend" button
  const [showResendButton, setShowResendButton] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // This effect checks if the user is already logged in
  useEffect(() => {
    if (cookies?.token) {
      router.replace("/");
    }
  }, [cookies?.token, router]);

  // FIX: This effect checks if the user just registered
  useEffect(() => {
    if (from === 'register') {
      setShowResendButton(true);
    }
  }, [from]);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setForm(prevForm => ({ ...prevForm, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await handleLogin(form);
      if (res?.user) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', form.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        dispatch(reduxLogin(res.user));
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:7000/api/auth/google";
  };

  const handleForgotPassword = () => {
    router.push("/auth/forgot-password");
  };

  // FIX: Handler for the new resend button
  const onResendVerification = () => {
    if (form.email) {
      handleResendVerification(form.email);
      setShowResendButton(false); // Hide button after one click
    } else {
      alert("Please enter your email address in the field above to resend the verification link.");
    }
  };

  return (
    <>
      <Head>
        <title>Login | LaggedOut</title>
      </Head>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ bgcolor: "#1b2838", color: "#c7d5e0" }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            bgcolor: "#2a3a4b",
            p: 4,
            borderRadius: 2,
            minWidth: 360,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{ textAlign: "center", color: "#ffffff", mb: 2 }}
          >
            Login
          </Typography>

          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            required
          />

          <TextField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: "#c7d5e0" }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            variant="outlined"
            required
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                name="rememberMe"
                color="primary"
              />
            }
            label="Remember me"
          />

          {loginError && (
            <Typography variant="body2" sx={{ color: "red", textAlign: "center" }}>
              {/* This will show login errors from the hook */}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            sx={{ bgcolor: "#66c0f4", color: "#1b2838", "&:hover": { bgcolor: "#77d1f5" } }}
            disabled={isLoginLoading}
          >
            {isLoginLoading ? <CircularProgress size={24} sx={{ color: "#1b2838" }} /> : "Login"}
          </Button>

          {/* FIX: Conditionally rendered button for resending verification email */}
          {showResendButton && (
            <Button
              variant="outlined"
              fullWidth
              onClick={onResendVerification}
              disabled={isResendLoading}
            >
              {isResendLoading ? <CircularProgress size={24} /> : "Resend Verification Email"}
            </Button>
          )}

          <Button
            variant="contained"
            startIcon={<img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: 18, height: 18, borderRadius: "50%" }} />}
            sx={{ bgcolor: "#4285F4", color: "#fff", "&:hover": { bgcolor: "#357ae8" } }}
            onClick={handleGoogleLogin}
          >
            Sign in with Google
          </Button>

          <Button variant="text" sx={{ color: "#66c0f4" }} onClick={handleForgotPassword}>
            Forgot Password?
          </Button>

          <Typography variant="body2" sx={{ textAlign: "center", mt: 2, color: "#c7d5e0" }}>
            Don't have an account?{" "}
            <Button variant="text" sx={{ color: "#66c0f4" }} onClick={() => router.push("/auth/register")}>
              Register
            </Button>
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default LoginPage;