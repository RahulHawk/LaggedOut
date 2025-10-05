import { useRouter } from 'next/router';
import { Box, Typography } from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';
import { useGamesQuery } from '@/customHooks/home.hooks.query';
import { GameCard } from '@/components/GameCard';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { useMemo } from 'react';
import { Loading } from '@/components/common/Loading';

const GamesByDeveloperPage = () => {
  const router = useRouter();
  const { id: developerId } = router.query;

  const { data: gamesResult, isLoading } = useGamesQuery({
    developer: developerId as string,
  }, {
    enabled: !!developerId,
  });

  const games = gamesResult?.data || [];
  const dev = games.length > 0 ? games[0].developer : null;
  const developerName = dev ? `${dev.firstName} ${dev.lastName}` : 'Developer';

  const categories = useMemo(() => [
    { key: "recentlyAdded", label: "Recently Added" },
    { key: "recentlyUpdated", label: "Recently Updated" },
    { key: "byGenre", label: "By Genre" },
    { key: "byDeveloper", label: "By Developer" },
  ], []);

  return (
    <>
      <Head>
        <title>Games by {developerName} | LaggedOut</title>
      </Head>
      <Box display="flex">
        <Sidebar categories={categories} />
        <Box 
          sx={{ 
            marginLeft: '240px', 
            p: 4, 
            flex: 1,
            color: '#fff',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1f2a38 0%, #101820 100%)'
          }}
        >
          {isLoading ? (
            <Loading />
          ) : (
            <>
              <Typography variant="h4" sx={{ mb: 3, color: '#fff', fontWeight: 700 }}>
                Games by {developerName}
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
                // --- THIS SECTION IS UPDATED ---
                <Typography sx={{ fontStyle: 'italic', color: 'grey.500', mt: 4 }}>
                  This developer has not published any games yet.
                  <Link href="/developers" style={{ color: '#66c0f4', textDecoration: 'underline', marginLeft: '5px', cursor: 'pointer' }}>
                    Try searching for other developers.
                  </Link>
                </Typography>
              )}
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default GamesByDeveloperPage;