'use client';

import { Box, Typography, TextField, Button, CircularProgress, keyframes, IconButton, InputAdornment, Link } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/customHooks/auth.hooks.query";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Head from "next/head";
import NextLink from 'next/link';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function RegisterPage() {
  const router = useRouter();
  const { handleRegister, loading, error } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await handleRegister(form);
      if (res?.status) {
        router.push("/auth/login?from=register");
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <>
      <Head>
        <title>Register | LaggedOut</title>
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
            width: 400,
            p: 4,
            borderRadius: 2,
            bgcolor: "#2a4b5d",
            animation: `${fadeIn} 0.5s ease-in-out`,
            boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          }}
        >
          <Typography variant="h4" mb={1} sx={{ color: "#ffffff", textAlign: "center" }}>
            Create an Account
          </Typography>
          <Typography variant="body2" mb={3} sx={{ color: "#8f98a0", textAlign: "center" }}>
            This registration is for **players only**.
          </Typography>

          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {error && (
            <Typography
              variant="body2"
              sx={{ color: "error.main", textAlign: "center", mt: 2 }}
            >
              {error.message}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Register"}
          </Button>

          <Button fullWidth sx={{ color: "#66c0f4" }} onClick={() => router.push("/auth/login")}>
            Already have an account? Login
          </Button>

          {/* FIX: Add the new link for developers */}
          <Typography variant="body2" sx={{ textAlign: 'center', mt: 3 }}>
            <Link component={NextLink} href="/auth/dev-request-link" sx={{ color: "#8f98a0" }}>
              Are you a developer? Contact support to register.
            </Link>
          </Typography>

        </Box>
      </Box>
    </>
  );
}