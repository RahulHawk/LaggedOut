import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Button, Stack } from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';

import { useGamesQuery } from '@/customHooks/home.hooks.query';
import { GameCard } from '@/components/GameCard';
import { SearchPageSkeleton } from '@/components/skeletons/SearchPageSkeleton';
import { Sidebar } from '@/components/Sidebar/Sidebar';

const GamesByGenrePage = () => {
  const router = useRouter();
  const { id: genreId } = router.query; // Get genre ID from the URL (e.g., '65e4d2f8b9c7d4a3e2f1b0a1')
  
  // State for pagination
  const [page, setPage] = useState(1);

  // Fetch games for the specific genre and current page
  const { data, isLoading, isError } = useGamesQuery({
    genre: genreId as string,
    page: page,
    limit: 12, // Show 12 games per page
  }, {
    enabled: !!genreId, // Only run the query when the genreId is available from the URL
  });

  const games = data?.data || [];
  const pagination = data?.pagination;
  
  // Safely get the genre name from the first game in the results for the page title
  const genreName = games.length > 0 && games[0].genre[0]?.name ? games[0].genre[0].name : 'Genre';

  const categories = useMemo(() => [
    { key: "recentlyAdded", label: "Recently Added" },
    { key: "recentlyUpdated", label: "Recently Updated" },
    { key: "byGenre", label: "By Genre" },
    { key: "byDeveloper", label: "By Developer" },
  ], []);

  return (
    <>
      <Head>
        <title>{`${genreName}`} Games | LaggedOut</title>
      </Head>

      <Box display="flex">
        <Sidebar categories={categories} />

        <Box sx={{ marginLeft: '240px', p: 4, flex: 1, minHeight: '100vh',
            background: 'linear-gradient(135deg, #1f2a38 0%, #101820 100%)',
        }}>
          {isLoading ? (
            <SearchPageSkeleton />
          ) : isError ? (
            <Typography color="error">Could not load games for this genre.</Typography>
          ) : (
            <>
              <Typography variant="h4" sx={{ mb: 3, color: '#fff', fontWeight: 700 }}>
                {genreName} Games
              </Typography>
              
              {games.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1 }}>
                  {games.map(game => (
                    <Box key={game._id} sx={{ p: 1, width: { xs: '100%', sm: '50%', md: '33.33%', lg: '25%' } }}>
                      <Link href={`/games/${game._id}`} passHref style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                        <Box sx={{ height: { xs: '350px', sm: '400px' } }}>
                          <GameCard game={game} />
                        </Box>
                      </Link>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ fontStyle: 'italic', color: 'grey.500', mt: 4 }}>
                  There are no games in this genre yet.
                </Typography>
              )}

              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 5 }}>
                  <Button
                    variant="contained"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Typography sx={{ color: '#fff', alignSelf: 'center' }}>
                    Page {pagination.page} of {pagination.totalPages}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </Stack>
              )}
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default GamesByGenrePage;