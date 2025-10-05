import { Box, Typography, FormControl, Select, MenuItem, Button } from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { GameCarousel } from '@/components/GameCarousel';
import { useGenrePreviewsQuery } from '@/customHooks/genre&tag.hooks.query'; 
import { useMemo } from 'react';
import { Loading } from '@/components/common/Loading';

const BrowseByGenrePage = () => {
  const router = useRouter();
  const { data: previewsResult, isLoading, isError } = useGenrePreviewsQuery();
  const genrePreviews = previewsResult?.data || [];

  console.log("Genre previews API response:", JSON.stringify(previewsResult, null, 2));

  const handleDropdownChange = (event: any) => {
    const genreId = event.target.value;
    if (genreId) {
      router.push(`/genres/${genreId}`);
    }
  };
  
  // CORRECTED: The categories array is now filled with your actual data
  const categories = useMemo(() => [
    { key: "recentlyAdded", label: "Recently Added" },
    { key: "recentlyUpdated", label: "Recently Updated" },
    { key: "byGenre", label: "By Genre" },
    { key: "byDeveloper", label: "By Developer" },
  ], []);

  return (
    <>
      <Head>
        <title>Browse by Genre | LaggedOut</title>
      </Head>
      <Box display="flex">
        <Sidebar categories={categories} />
        <Box sx={{ 
            marginLeft: '240px', 
            p: 4, 
            flex: 1, 
            color: '#fff',
            background: 'linear-gradient(135deg, #1f2a38 0%, #101820 100%)',
            minHeight: '100vh'
        }}>
          
          {isLoading ? (
            <Loading /> 
          ) : isError ? (
            <Typography color="error">Could not load genres.</Typography>
          ) : (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight={700}>
                  Browse by Genre
                </Typography>
                
                <FormControl sx={{ m: 1, minWidth: 250 }}>
                  <Select
                    value=""
                    onChange={handleDropdownChange}
                    displayEmpty
                    sx={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                      color: '#fff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      '& .MuiSvgIcon-root': { color: '#fff' }
                    }}
                  >
                    <MenuItem value="">
                      <em>Select a genre to jump to...</em>
                    </MenuItem>
                    {genrePreviews.map(genre => (
                      <MenuItem key={genre._id} value={genre._id}>{genre.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {genrePreviews.map(genre => (
                <Box key={genre._id} mb={4}>
                  <GameCarousel 
                    title={genre.name} 
                    games={genre.games} 
                    showAllLink={`/genres/${genre._id}`} 
                  />
                </Box>
              ))}
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default BrowseByGenrePage;