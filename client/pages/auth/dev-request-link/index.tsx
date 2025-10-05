import { Box, Typography, TextField, Button, CircularProgress, keyframes } from "@mui/material";
import { useState } from "react";
import { useAuth } from "@/customHooks/auth.hooks.query";
import Head from "next/head";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const DevRequestLinkPage = () => {
  const { handleRequestDevLink, loading, error } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    const res = await handleRequestDevLink({ firstName, lastName, email });
    if (res?.status) {
      setSuccessMsg(res.message);
      setFirstName(""); setLastName(""); setEmail("");
    }
  };

  return (
    <>
      <Head>
        <title>Dev Register Request | LaggedOut</title>
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
          sx={{
            width: 400,
            p: 4,
            bgcolor: "#2a3a4b",
            borderRadius: 2,
            animation: `${fadeIn} 0.5s ease-in-out`,
            boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          }}
        >
          <Typography variant="h4" mb={1} sx={{ color: "#ffffff", textAlign: "center" }}>
            Request Developer Registration Link
          </Typography>
          <Typography variant="body2" mb={3} sx={{ color: "#c7d5e0", textAlign: "center" }}>
            Enter your details to receive a developer registration link via email.
          </Typography>

          {error && <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>{error}</Typography>}
          {successMsg && <Typography color="success.main" sx={{ mb: 2, textAlign: "center" }}>{successMsg}</Typography>}

          <TextField
            fullWidth
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            margin="normal"
            required
            sx={{ input: { color: "#c7d5e0" }, label: { color: "#c7d5e0" }, fieldset: { borderColor: "#66c0f4" }, '&:hover fieldset': { borderColor: '#77d1f5' } }}
          />
          <TextField
            fullWidth
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            margin="normal"
            required
            sx={{ input: { color: "#c7d5e0" }, label: { color: "#c7d5e0" }, fieldset: { borderColor: "#66c0f4" }, '&:hover fieldset': { borderColor: '#77d1f5' } }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            sx={{ input: { color: "#c7d5e0" }, label: { color: "#c7d5e0" }, fieldset: { borderColor: "#66c0f4" }, '&:hover fieldset': { borderColor: '#77d1f5' } }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, bgcolor: "#66c0f4", "&:hover": { bgcolor: "#77d1f5" } }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "#000" }} /> : "Request Link"}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default DevRequestLinkPage;
