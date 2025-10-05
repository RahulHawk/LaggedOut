import { useState } from "react";
import { Box, Typography, TextField, Button, CircularProgress } from "@mui/material";
import { useAuth } from "@/customHooks/auth.hooks.query";
import Head from "next/head";

const ForgotPasswordPage = () => {
  const { handleForgotPassword, isForgotPasswordLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleForgotPassword(email);
    setSubmitted(true);
  };

  return (
    <>
      <Head><title>Forgot Password | LaggedOut</title></Head>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ bgcolor: "#1b2838", color: "#c7d5e0" }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ bgcolor: "#2a3a4b", p: 4, borderRadius: 2, minWidth: 360, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h5" sx={{ textAlign: "center", color: "#ffffff", mb: 2 }}>Forgot Password</Typography>

          {submitted ? (
            <Typography sx={{ textAlign: 'center' }}>
              If an account with that email exists, a password reset link has been sent to your inbox.
            </Typography>
          ) : (
            <>
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                variant="outlined"
                required
              />
              <Button type="submit" variant="contained" disabled={isForgotPasswordLoading}>
                {isForgotPasswordLoading ? <CircularProgress size={24} /> : "Send Reset Link"}
              </Button>
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default ForgotPasswordPage;