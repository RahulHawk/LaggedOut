import React, { useState, useMemo } from "react";
import { Box, Typography, List, ListSubheader, ListItemButton, ListItemText, ListItemAvatar, Avatar, Fab, Tooltip } from "@mui/material";
import Head from "next/head";
import NextLink from 'next/link';
import { useFavorites, useHomeMutations } from "@/customHooks/misc.hooks.query";
import { useMyPurchaseHistoryQuery } from "@/customHooks/commerce.hooks.query";
import { Game } from "@/typescript/homeTypes";
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { LibraryGameCard } from "@/components/library/LibraryGameCard";
import { Loading } from "@/components/common/Loading";
import { RefundRequestModal } from "@/components/library/RefundRequestModal";

const scrollableListSx = {
    overflowY: 'auto',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
};

const LibraryPage = () => {
    const [view, setView] = useState<'all' | 'favorites'>('all');
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

    const { data: purchases, isLoading: isLibraryLoading } = useMyPurchaseHistoryQuery();
    const { data: favorites = [], isLoading: isFavoritesLoading } = useFavorites();
    const { addFavorite, removeFavorite, isAddingFavorite, isRemovingFavorite } = useHomeMutations();

    // --- FIXED: favoriteIds never contains undefined ---
    const favoriteIds = useMemo(() => new Set(favorites.map((game: Game) => game._id || "")), [favorites]);

    const sortedFullLibrary = useMemo(() => {
        if (!purchases) return [];
        return [...purchases]
            .filter(p => p.game)
            .sort((a, b) => a.game.title.localeCompare(b.game.title));
    }, [purchases]);

    const favoriteLibraryItems = useMemo(() => {
        if (!sortedFullLibrary || favoriteIds.size === 0) return [];
        return sortedFullLibrary.filter(p => favoriteIds.has(p.game._id));
    }, [sortedFullLibrary, favoriteIds]);

    if (isLibraryLoading || isFavoritesLoading) {
        return <Loading />;
    }

    const itemsToDisplay = view === 'favorites' ? favoriteLibraryItems : sortedFullLibrary;

    const handleToggleFavorite = (game: Game, isCurrentlyFavorite: boolean) => {
        if (isCurrentlyFavorite) {
            removeFavorite(game._id); // exact ID
        } else {
            addFavorite(game._id);
        }
    };

    return (
        <>
            <Head><title>My Library | LaggedOut</title></Head>
            <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', bgcolor: '#1b2838', color: '#c7d5e0' }}>
                {/* --- SIDEBAR --- */}
                <Box sx={{ width: '300px', flexShrink: 0, bgcolor: '#1a2a3a', height: '100%', borderRight: '1px solid #000', display: 'flex', flexDirection: 'column' }}>
                    <List dense disablePadding sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <ListSubheader onClick={() => setView('all')} sx={{ bgcolor: '#1a2a3a', color: '#c7d5e0', cursor: 'pointer', borderBottom: '1px solid #000' }}>
                            All Games ({sortedFullLibrary.length})
                        </ListSubheader>
                        <ListSubheader onClick={() => setView('favorites')} sx={{ bgcolor: '#1a2a3a', color: '#c7d5e0', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <AutoAwesomeMosaicIcon sx={{ color: '#66c0f4', mr: 1, fontSize: '20px' }} /> Favorites ({favoriteLibraryItems.length})
                        </ListSubheader>
                        <Box sx={{ flex: 1, ...scrollableListSx }}>
                            {sortedFullLibrary.map((purchase) => (
                                <NextLink key={purchase._id} href={`/games/${purchase.game._id}`} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <ListItemButton>
                                        <ListItemAvatar sx={{ mr: 1 }}>
                                            <Avatar variant="square" src={purchase.game.coverImage} />
                                        </ListItemAvatar>
                                        <ListItemText primary={purchase.game.title} />
                                    </ListItemButton>
                                </NextLink>
                            ))}
                        </Box>
                    </List>
                </Box>

                {/* --- MAIN CONTENT GRID --- */}
                <Box sx={{ flexGrow: 1, p: 3, ...scrollableListSx }}>
                    <Typography variant="h4" gutterBottom textTransform="capitalize">
                        {view}
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                        {itemsToDisplay.length > 0 ? itemsToDisplay.map((purchase) => {
                            const isFavorite = favoriteIds.has(purchase.game._id);
                            return (
                                <NextLink key={purchase._id} href={`/games/${purchase.game._id}`} passHref style={{ textDecoration: 'none' }}>
                                    <Box sx={{ aspectRatio: '2 / 3', height: 'auto' }}>
                                        <LibraryGameCard
                                            game={purchase.game}
                                            addedAt={purchase.purchasedAt}
                                            isFavorite={isFavorite}
                                            onToggleFavorite={() => handleToggleFavorite(purchase.game, isFavorite)}
                                            isAddingFavorite={isAddingFavorite}
                                            isRemovingFavorite={isRemovingFavorite}
                                        />
                                    </Box>
                                </NextLink>
                            );
                        }) : (
                            <Typography sx={{ p: 2, gridColumn: '1 / -1', fontStyle: 'italic' }}>
                                {view === 'favorites' ? "You haven't added any favorites yet." : "Your library is empty."}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* --- FLOATING ACTION BUTTON AND MODAL --- */}
                <Tooltip title="Request Refund" placement="left">
                    <Fab
                        color="primary"
                        aria-label="request refund"
                        onClick={() => setIsRefundModalOpen(true)}
                        sx={{ position: 'fixed', bottom: 32, right: 32 }}
                    >
                        <ReceiptLongIcon />
                    </Fab>
                </Tooltip>
                <RefundRequestModal
                    open={isRefundModalOpen}
                    onClose={() => setIsRefundModalOpen(false)}
                    purchases={purchases || []}
                />
            </Box>
        </>
    );
};

export default LibraryPage;
