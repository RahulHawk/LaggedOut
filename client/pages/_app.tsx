// pages/_app.tsx

import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { Wrapper } from "@/layout/wrapper/wrapper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme, CssBaseline, Typography, Box } from "@mui/material"; // Import CssBaseline
import { Orbitron, Poppins } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { SocketProvider } from "@/context/SocketProvider";
import { useOnlineStatus } from '@/customHooks/useOnlineStatus'; 
import WifiOffIcon from '@mui/icons-material/WifiOff';

const queryClient = new QueryClient();

const orbitron = Orbitron({ weight: ['400', '600', '700'], subsets: ['latin'], display: 'swap' });
const poppins = Poppins({ weight: ['400', '500', '700'], subsets: ['latin'], display: 'swap' });

function OfflineIndicator() {
    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                bgcolor: 'error.main',
                color: 'white',
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 1,
                gap: 1,
            }}
        >
            <WifiOffIcon fontSize="small" />
            <Typography variant="body2" fontWeight="bold">
                You are currently offline.
            </Typography>
        </Box>
    );
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1b2838',
      paper: '#2a475e',
    },
    primary: { main: '#66c0f4' },
    secondary: { main: '#c7d5e0' },
    success: { main: '#7ed56f' },
    error: { main: '#eb5e55' },
  },
  typography: {
    fontFamily: poppins.style.fontFamily,
    h1: { fontFamily: orbitron.style.fontFamily, color: '#ffffff', fontSize: '2.2rem', '@media (min-width:600px)': { fontSize: '3rem' } },
    h2: { fontFamily: orbitron.style.fontFamily, color: '#ffffff', fontSize: '1.8rem' },
    h3: { fontFamily: orbitron.style.fontFamily, color: '#ffffff', fontSize: '1.4rem' },
    h4: { fontFamily: orbitron.style.fontFamily, color: '#ffffff' },
    h5: { fontFamily: orbitron.style.fontFamily, color: '#ffffff' },
    h6: { fontFamily: orbitron.style.fontFamily, color: '#ffffff' },
    body1: { color: '#c7d5e0', fontSize: '0.95rem' },
    body2: { color: '#8f98a0', fontSize: '0.85rem' },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundColor: '#2a475e', borderRadius: 4 },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontFamily: poppins.style.fontFamily, fontWeight: '700' },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' },
        },
      },
    },
  }
});

export default function App({ Component, pageProps }: AppProps) {
  const isOnline = useOnlineStatus();
  return (
    <Provider store={store}>
      <SocketProvider>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <QueryClientProvider client={queryClient}>
            <Wrapper>
              {!isOnline && <OfflineIndicator />}
              <Component {...pageProps} />
            </Wrapper>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
            />
          </QueryClientProvider>
        </ThemeProvider>
      </SocketProvider>
    </Provider>
  );
}