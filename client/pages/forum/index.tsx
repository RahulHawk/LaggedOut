import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import {
    Container,
    Box,
    Typography,
    TextField,
    InputAdornment,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    CircularProgress,
    ListItemButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { useGamesQuery } from '@/customHooks/home.hooks.query';
import { useDebounce } from '@/customHooks/useDebounce';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { Game } from '@/typescript/homeTypes';

const ForumHomePage = () => {
    // This search functionality remains completely unchanged.
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const { data: searchResults, isLoading: isSearchLoading } = useGamesQuery(
        { search: debouncedSearchQuery, limit: 10 },
        { enabled: !!debouncedSearchQuery }
    );

    // UPDATED: This 'categories' array now uses keys that your new Sidebar
    // component recognizes from its internal 'categoryLinks' object.
    const categories = useMemo(() => [
        { key: "recentlyAdded", label: "Recently Added" },
        { key: "recentlyUpdated", label: "Recently Updated" },
        { key: "byGenre", label: "by Genre" },
        { key: "byDeveloper", label: "by Developer" },
    ], []);

    return (
        <>
            <Head><title>Forums | LaggedOut</title></Head>
            <Box sx={{ display: 'flex', bgcolor: "#1b2838", minHeight: '100vh', color: '#c7d5e0' }}>
                {/* The unchanged Sidebar now receives categories it can render */}
                <Sidebar categories={categories} />
                
                {/* The main content of the page is identical to before */}
                <Box component="main" sx={{ flexGrow: 1, marginLeft: '240px', p: 4 }}>
                    <Container maxWidth="md">
                        <Typography variant="h3" component="h1" gutterBottom>
                            Game Forums
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 4 }}>
                            Find a game to join the discussion, ask questions, or post announcements.
                        </Typography>

                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search for a game's forum..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'rgba(0,0,0,0.2)',
                                },
                            }}
                        />

                        <Paper sx={{ bgcolor: '#2a475e' }}>
                            {isSearchLoading && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress />
                                </Box>
                            )}
                            {searchResults && debouncedSearchQuery && (
                                <List>
                                    {searchResults.data.map((game: Game) => (
                                        <ListItem key={game._id} disablePadding>
                                            <NextLink href={`/forum/game/${game._id}`} passHref legacyBehavior>
                                                <ListItemButton component="a">
                                                    <ListItemAvatar>
                                                        <Avatar variant="square" src={game.coverImage} />
                                                    </ListItemAvatar>
                                                    <ListItemText primary={game.title} />
                                                </ListItemButton>
                                            </NextLink>
                                        </ListItem>
                                    ))}
                                    {searchResults.data.length === 0 && (
                                        <ListItem>
                                            <ListItemText primary={`No results found for "${debouncedSearchQuery}"`} />
                                        </ListItem>
                                    )}
                                </List>
                            )}
                        </Paper>
                    </Container>
                </Box>
            </Box>
        </>
    );
};

export default ForumHomePage;