import { Box, Skeleton } from '@mui/material'; // REMOVED: Grid import

export const SearchPageSkeleton = () => {
  return (
    <Box sx={{ width: '100%' }}>
      {/* Title Skeleton is unchanged */}
      <Skeleton variant="text" width={400} height={60} sx={{ mb: 4 }} />

      {/* REPLACED: Grid container with a flexbox Box */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1 }}>
        {[...Array(8)].map((_, index) => (
          // REPLACED: Grid item with a Box using responsive width
          <Box 
            key={index} 
            sx={{ 
              p: 1, // This creates the spacing
              width: { xs: '100%', sm: '50%', md: '33.33%', lg: '25%' } 
            }}
          >
            <Skeleton 
              variant="rectangular" 
              sx={{ 
                width: '100%', 
                aspectRatio: '2.25 / 3', 
                borderRadius: 2 
              }} 
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};