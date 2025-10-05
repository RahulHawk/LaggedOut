import { Box, Typography, TextField, Button, CircularProgress, IconButton, InputAdornment } from "@mui/material";
import { useState } from "react";
import { useAuth } from "@/customHooks/auth.hooks.query";
import { useRouter } from "next/router";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Head from "next/head";

const DevRegisterPage = () => {
  const router = useRouter();
  const { handleRegisterDev, loading, error } = useAuth();
  const { token } = router.query;

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");

    if (!token || typeof token !== "string") return;

    const res = await handleRegisterDev({ token, data: { userName, password } });
    if (res?.status) {
      setSuccessMsg(res.message);
      setUserName("");
      setPassword("");
    }
  };

  return (
    <>
      <Head>
        <title>Dev Register | LaggedOut</title>
      </Head>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ bgcolor: "#1b2838", color: "#c7d5e0", p: 2 }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ width: 400, p: 4, bgcolor: "#2a3a4b", borderRadius: 2 }}
        >
          <Typography variant="h5" sx={{ mb: 2, color: "#fff", fontWeight: 600 }}>
            Developer Registration
          </Typography>

          <TextField
            label="Username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            fullWidth
            margin="normal"
            required
            sx={{ input: { color: "#c7d5e0" } }}
          />

          <TextField
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            type={showPassword ? "text" : "password"}
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
              sx: { color: "#c7d5e0" },
            }}
          />

          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          {successMsg && <Typography color="success.main" sx={{ mt: 1 }}>{successMsg}</Typography>}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, bgcolor: "#66c0f4", "&:hover": { bgcolor: "#77d1f5" } }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Register"}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default DevRegisterPage;
