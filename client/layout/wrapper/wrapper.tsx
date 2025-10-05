import React, { ReactNode } from "react";
import { Box } from "@mui/material";
import { Header } from "../header/header";
import { Footer } from "../footer/footer";

interface WrapperProps {
  children: ReactNode;
}

export const Wrapper: React.FC<WrapperProps> = ({ children }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh", 
      }}
    >
      <Header />

      <Box
        component="main"
        sx={{
          flex: 1,
          overflowX: "hidden",
        }}
      >
        {children}
      </Box>

      <Footer />
    </Box>
  );
};