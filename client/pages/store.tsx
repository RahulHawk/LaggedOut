import { useRouter } from 'next/router';
import { Box, Typography } from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';

import { useGamesQuery } from '@/customHooks/home.hooks.query';
import { GameCard } from '@/components/GameCard';
import { SearchPageSkeleton } from '@/components/skeletons/SearchPageSkeleton';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { useState, useMemo } from 'react';

const StorePage = () => {
    const router = useRouter();
    const { search } = router.query;

    const { data: searchResult, isLoading, isError } = useGamesQuery({
        search: search as string,
        limit: 12,
    });

    const games = searchResult?.data || [];

    const categories = useMemo(() => [
        { key: "recentlyAdded", label: "Recently Added" },
        { key: "recentlyUpdated", label: "Recently Updated" },
        { key: "byGenre", label: "By Genre" },
        { key: "byDeveloper", label: "By Developer" },
    ], []);


    return (
        <>
            <Head>
                <title>{search ? `Results for "${search}"` : 'Store'} | LaggedOut</title>
            </Head>
            <Sidebar
                categories={categories}
            />
            <Box
                sx={{
                    marginLeft: '240px',
                    p: { xs: 2, sm: 4 },
                    minHeight: '100vh',
                    color: '#c7d5e0',
                    background: 'linear-gradient(135deg, #1f2a38 0%, #101820 100%)',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
                }}
            >

                {isLoading && <SearchPageSkeleton />}

                {isError && !isLoading && (
                    <Typography color="error">
                        Sorry, there was an error fetching the results. Please try again later.
                    </Typography>
                )}

                {!isLoading && !isError && search && (
                    <>
                        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#e0f2f7' }}>
                            {games.length > 0
                                ? `Showing results for "${search}"`
                                : `No results found for "${search}"`}
                        </Typography>

                        {games.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1 }}>
                                {games.map((game) => (
                                    <Box
                                        key={game._id}
                                        sx={{
                                            p: 1,
                                            width: { xs: '100%', sm: '50%', md: '33.33%', lg: '25%' }
                                        }}
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
                                Try searching for another title.
                            </Typography>
                        )}
                    </>
                )}
            </Box>
        </>
    );
};

export default StorePage;