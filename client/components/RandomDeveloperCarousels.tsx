// components/RandomDeveloperCarousels.tsx
import { useDevelopersQuery } from "@/customHooks/home.hooks.query";
import { Developer } from "@/typescript/homeTypes";
import { DeveloperRow } from "./DeveloperRow"; 
import { Box, Typography, Skeleton } from "@mui/material";
import { useMemo } from "react";

// Helper function to shuffle an array (Fisher-Yates shuffle)
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const RandomDeveloperCarousels = () => {
  const { data: developersResult, isLoading } = useDevelopersQuery();
  const allDevelopers = developersResult?.data || [];

  // Memoize the random selection so it doesn't change on every re-render
  const randomDevelopers = useMemo(() => {
    if (allDevelopers.length > 0) {
      return shuffleArray(allDevelopers).slice(0, 5);
    }
    return [];
  }, [allDevelopers]);

  if (isLoading) {
    // Show a few skeletons while loading the developer list
    return (
      <Box>
        {[...Array(3)].map((_, index) => (
          <Box key={index} mb={4}>
            <Skeleton variant="text" width={250} height={40} />
            <Skeleton variant="rectangular" height={320} />
          </Box>
        ))}
      </Box>
    );
  }

  if (randomDevelopers.length === 0) {
    return <Typography>No developers found to display.</Typography>;
  }

  return (
    <Box>
      {randomDevelopers.map((developer: Developer) => (
        <DeveloperRow key={developer._id} developer={developer} />
      ))}
    </Box>
  );
};