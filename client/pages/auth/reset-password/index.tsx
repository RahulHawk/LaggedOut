import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, CircularProgress } from "@mui/material";
import { useAuth } from "@/customHooks/auth.hooks.query";
import { useRouter } from "next/router";
import Head from "next/head";

const ResetPasswordPage = () => {
  const router = useRouter();
  const { token } = router.query;
  const { handleResetPassword, isResetPasswordLoading } = useAuth();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    try {
      await handleResetPassword({ token: token as string, password, confirmPassword });
      router.push('/auth/login');
    } catch (err) {
      // Error is handled by the hook's toast message
    }
  };

  return (
    <>
      <Head><title>Reset Password | LaggedOut</title></Head>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ bgcolor: "#1b2838", color: "#c7d5e0" }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ bgcolor: "#2a3a4b", p: 4, borderRadius: 2, minWidth: 360, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h5" sx={{ textAlign: "center", color: "#ffffff", mb: 2 }}>Reset Your Password</Typography>
          
          <TextField label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth variant="outlined" required />
          <TextField label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} fullWidth variant="outlined" required error={!!error} helperText={error} />
          
          <Button type="submit" variant="contained" disabled={isResetPasswordLoading}>
            {isResetPasswordLoading ? <CircularProgress size={24} /> : "Reset Password"}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default ResetPasswordPage;