import { Box, Typography } from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';
import { useGamesQuery } from '@/customHooks/home.hooks.query';
import { GameCard } from '@/components/GameCard';
import { SearchPageSkeleton } from '@/components/skeletons/SearchPageSkeleton';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { useState, useMemo } from 'react';
import { Loading } from '@/components/common/Loading';

const RecentlyUpdatedPage = () => {
    const { data: gamesResult, isLoading, isError } = useGamesQuery({
        sort: 'updated_desc',
        limit: 12,
    });

    const games = gamesResult?.data || [];

    const categories = useMemo(() => [
        { key: "recentlyAdded", label: "Recently Added" },
        { key: "recentlyUpdated", label: "Recently Updated" },
        { key: "byGenre", label: "By Genre" },
        { key: "byDeveloper", label: "By Developer" },
    ], []);

    if (isLoading) {
        return (
            <Loading />
        );
    }

    return (
        <>
            <Head>
                <title>Recently Updated | LaggedOut</title>
            </Head>

            <Sidebar
                categories={categories}
            />
            <Box
                sx={{
                    marginLeft: '240px',
                    p: { xs: 2, sm: 4 },
                    color: '#c7d5e0',
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #1f2a38 0%, #101820 100%)',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
                }}
            >

                {isLoading && <SearchPageSkeleton />}

                {isError && !isLoading && (
                    <Typography color="error">
                        Sorry, there was an error fetching recently updated games. Please try again later.
                    </Typography>
                )}

                {!isLoading && !isError && (
                    <>
                        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#e0f2f7' }}>
                            Recently Updated Games
                        </Typography>

                        {games.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1 }}>
                                {games.map((game) => (
                                    <Box
                                        key={game._id}
                                        sx={{ p: 1, width: { xs: '100%', sm: '50%', md: '33.33%', lg: '25%' } }}
                                    >
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
                                No recently updated games to display.
                            </Typography>
                        )}
                    </>
                )}
            </Box>
        </>
    );
};

export default RecentlyUpdatedPage;