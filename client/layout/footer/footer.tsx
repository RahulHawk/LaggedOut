"use client";

import { useState } from 'react'; // ADDED
import { Box, Container, Typography, TextField, Button, IconButton, Stack } from '@mui/material';
import { Twitter, Instagram, YouTube, Facebook } from '@mui/icons-material';
import Swal from 'sweetalert2'; // ADDED
import withReactContent from 'sweetalert2-react-content'; // ADDED

// ADDED: Initialize SweetAlert2 for React
const MySwal = withReactContent(Swal);

export const Footer = () => {
  // ADDED: State to manage the email input
  const [email, setEmail] = useState('');

  // ADDED: Handler function for the button click
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the page from reloading
    if (!email.trim()) {
      MySwal.fire({
        title: 'Oops!',
        text: 'Please enter an email address.',
        icon: 'warning',
        background: '#2a3a4b',
        color: '#fff',
        confirmButtonColor: '#66c0f4'
      });
      return;
    }

    MySwal.fire({
      title: 'Thank You!',
      text: 'You have successfully subscribed to our newsletter.',
      icon: 'success',
      timer: 2500,
      showConfirmButton: false,
      background: '#2a3a4b',
      color: '#fff',
    });

    setEmail(''); // Clear the input field
  };

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        mt: 'auto',
        backgroundColor: '#171a21',
        borderTop: '1px solid #2a3a4b',
        color: '#c7d5e0',
        zIndex: 1200
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 3, md: 4 }}
          justifyContent="space-between"
          alignItems="center"
        >
          {/* Section 1: Logo and Copyright */}
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: ".2rem" }}>
              LaggedOut
            </Typography>
            <Typography variant="body2" color="#a9a9a9">
              © {new Date().getFullYear()} LaggedOut. All Rights Reserved.
            </Typography>
          </Box>

          {/* Section 2: Newsletter Signup */}
          {/* CHANGED: This Box is now a form */}
          <Box component="form" onSubmit={handleNewsletterSubmit} sx={{ width: { xs: '100%', md: '40%' } }}>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="your.email@example.com"
                value={email} // ADDED
                onChange={(e) => setEmail(e.target.value)} // ADDED
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    color: '#fff',
                    '& fieldset': { borderColor: '#2a3a4b' },
                    '&:hover fieldset': { borderColor: '#66c0f4' },
                  },
                  '& .MuiInputBase-input': { color: '#fff' },
                }}
              />
              <Button
                type="submit" // CHANGED
                variant="contained"
                sx={{ bgcolor: '#66c0f4', '&:hover': { bgcolor: '#77d1f5' }, whiteSpace: 'nowrap' }}
              >
                Sign Up
              </Button>
            </Stack>
          </Box>

          {/* Section 3: Social Media Icons */}
          <Box>
            <Stack direction="row" spacing={1}>
              <IconButton href="https://twitter.com" target="_blank" sx={{ color: '#c7d5e0', '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                <Twitter />
              </IconButton>
              <IconButton href="https://facebook.com" target="_blank" sx={{ color: '#c7d5e0', '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                <Facebook />
              </IconButton>
              <IconButton href="https://instagram.com" target="_blank" sx={{ color: '#c7d5e0', '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                <Instagram />
              </IconButton>
              <IconButton href="https://youtube.com" target="_blank" sx={{ color: '#c7d5e0', '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                <YouTube />
              </IconButton>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};