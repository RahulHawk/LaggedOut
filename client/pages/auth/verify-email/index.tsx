import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useAuth } from '@/customHooks/auth.hooks.query';
import Head from 'next/head';
import { AxiosError } from 'axios'; // FIX: Import AxiosError to check the type

const VerifyEmailPage = () => {
    const router = useRouter();
    const { token } = router.query;

    const {
        handleVerifyEmail,
        isVerifyingEmail,
        isVerificationSuccess,
        isVerificationError,
        verificationError,
    } = useAuth();

    useEffect(() => {
        if (token && typeof token === 'string') {
            handleVerifyEmail(token);
        }
    }, [token, handleVerifyEmail]);

    const renderContent = () => {
        if (isVerifyingEmail || !token) {
            return (
                <>
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography variant="h6">Verifying your email...</Typography>
                </>
            );
        }

        if (isVerificationSuccess) {
            return (
                <>
                    <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" gutterBottom>Verification Successful!</Typography>
                    <Typography>Your email has been verified. You can now log in to your account.</Typography>
                    <Button
                        variant="contained"
                        sx={{ mt: 3 }}
                        onClick={() => router.push('/auth/login')}
                    >
                        Return to Login
                    </Button>
                </>
            );
        }

        if (isVerificationError) {
            // FIX: Safely determine the error message by checking the type
            let errorMessage = "An unexpected error occurred. Please try again.";
            if (verificationError instanceof AxiosError) {
                errorMessage = verificationError.response?.data?.message || "Invalid or expired token.";
            } else if (verificationError instanceof Error) {
                errorMessage = verificationError.message;
            }

            return (
                <>
                    <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" gutterBottom>Verification Failed</Typography>
                    <Typography color="error">
                        {errorMessage}
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{ mt: 3 }}
                        onClick={() => router.push('/auth/login')}
                    >
                        Return to Login
                    </Button>
                </>
            );
        }

        return null;
    };

    return (
        <>
            <Head><title>Email Verification | LaggedOut</title></Head>
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                sx={{ bgcolor: "#1b2838", color: "#c7d5e0", p: 2 }}
            >
                <Box
                    sx={{
                        bgcolor: "#2a4b5d",
                        p: 4,
                        borderRadius: 2,
                        width: '100%',
                        maxWidth: 500,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    {renderContent()}
                </Box>
            </Box>
        </>
    );
};

export default VerifyEmailPage;