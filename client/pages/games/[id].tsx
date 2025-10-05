// src/pages/games/[id].tsx

import { useRouter } from 'next/router';
import Head from 'next/head';
import React, { useState, useMemo } from 'react';
import NextLink from 'next/link';

// --- Data & State Hooks ---
import { useGame } from '@/customHooks/game.hooks.query';
import { useCartQuery, useAddToCartMutation, usePurchaseHistoryQuery } from '@/customHooks/commerce.hooks.query';
import { useWishlist, useHomeMutations } from '@/customHooks/misc.hooks.query';
import useReviewMutations, { useReviewsQuery, useUserReviewQuery } from '@/customHooks/review.hooks.query';
import { ReviewEditorModal } from '@/components/reviews/ReviewEditorModal';
import { WishlistItem } from '@/typescript/homeTypes';
import { Purchase } from '@/typescript/commerceTypes';

// --- Component & MUI Imports ---
import {
    Container, Box, Typography, Alert, Chip, Button, Paper, Link, Rating, ImageList, ImageListItem, Dialog, DialogContent, IconButton,
    Avatar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { GameLoading } from '@/components/common/GameLoading';

const GamePage = () => {
    const router = useRouter();
    const { id } = router.query;
    const gameId = typeof id === 'string' ? id : undefined;

    const categories = useMemo(() => [
        { key: "recentlyAdded", label: "Recently Added" },
        { key: "recentlyUpdated", label: "Recently Updated" },
        { key: "byGenre", label: "By Genre" },
        { key: "byDeveloper", label: "By Developer" },
    ], []);

    // --- Data Fetching Hooks ---
    const { data: game,isLoading, isFetching, isError, error } = useGame(gameId);
    const { data: purchaseHistory } = usePurchaseHistoryQuery(gameId);
    const { data: wishlistData } = useWishlist<WishlistItem[]>();
    const { data: cartData } = useCartQuery();
    const { mutate: addToCart, isPending: isAddingToCart } = useAddToCartMutation();
    const { addToWishlist, removeFromWishlist } = useHomeMutations();

    // --- Local State ---
    const [openViewer, setOpenViewer] = useState(false);
    const [viewerContent, setViewerContent] = useState<{ type: 'image' | 'video', url: string } | null>(null);
    const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

    // --- Helper to check if an item is in the user's library ---
    const isOwned = (editionId?: string, dlcId?: string): boolean => {
        if (!purchaseHistory || !game) return false;

        // Check for specific DLC ownership
        if (dlcId) {
            // Check if this DLC was bought directly
            if (purchaseHistory.some(p => p.dlc === dlcId)) return true;

            // Check if any OWNED edition includes this DLC
            const ownedEditions = purchaseHistory.filter(p => p.edition && p.edition !== "Standard Edition");
            for (const purchase of ownedEditions) {
                const gameEdition = game.editions.find(e => e.name === purchase.edition);
                if (gameEdition?.includesDLCs?.some(id => id.toString() === dlcId)) {
                    return true; // Owned via an edition
                }
            }
        }

        // Check for specific Edition ownership
        if (editionId) {
            const edition = game.editions.find(e => e._id === editionId);
            return purchaseHistory.some(p => p.edition === edition?.name);
        }

        // Check for base game ownership (any purchase of this game counts)
        if (!editionId && !dlcId) {
            return purchaseHistory.length > 0;
        }

        return false;
    };

    const isInWishlist = useMemo(() => {
        if (!wishlistData || !game) return false;
        return wishlistData.some((item) => item.game && item.game._id === game._id);
    }, [wishlistData, game]);

    const currencyFormatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    });

    const { data: reviewsData } = useReviewsQuery({ gameId: gameId as string, limit: 4 });
    const { data: userReviewData } = useUserReviewQuery(gameId as string);
    const { deleteReview } = useReviewMutations(gameId as string);
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);

    const existingReview = userReviewData?.review || null;

    const handleDeleteReview = () => {
        if (existingReview && window.confirm("Are you sure you want to delete your review?")) {
            deleteReview(existingReview._id);
        }
    };

    // --- Event Handlers ---
    const handleOpenViewer = (type: 'image' | 'video', url: string) => {
        setViewerContent({ type, url });
        setOpenViewer(true);
    };

    const handleCloseViewer = () => {
        setOpenViewer(false);
        setViewerContent(null);
    };

    const isInCart = (editionId?: string, dlcId?: string): boolean => {
        if (!cartData?.cart || !game) return false;
        return cartData.cart.some(item =>
            item.gameId === game._id &&
            (item.editionId || null) === (editionId || null) &&
            (item.dlcId || null) === (dlcId || null)
        );
    };

    const handleAddToCart = (editionId?: string, dlcId?: string) => {
        if (!game) return;
        const actionId = editionId || dlcId || 'base';
        setLoadingActionId(actionId);
        addToCart(
            { gameId: game._id, editionId, dlcId },
            { onSettled: () => setLoadingActionId(null) }
        );
    };

    const handleBuyNow = (editionId?: string, dlcId?: string) => {
        if (!game) return;
        const query: { gameId: string; editionId?: string; dlcId?: string } = { gameId: game._id };
        if (editionId) query.editionId = editionId;
        if (dlcId) query.dlcId = dlcId;
        router.push({ pathname: '/checkout', query });
    };

    const handleWishlistToggle = () => {
        if (!game) return;
        if (isInWishlist) {
            removeFromWishlist(game._id);
        } else {
            addToWishlist(game._id);
        }
    };

    const renderContent = () => {
        if (isLoading) return <GameLoading isLoading={isLoading} />;
        if (isFetching) return <GameLoading isLoading={isFetching} />;
        if (isError) return <Alert severity="error">{(error as Error).message || 'An unknown error occurred.'}</Alert>;
        if (!game) return <Alert severity="warning">Game not found.</Alert>;

        const renderPrice = (basePrice: number, salePrice?: number, onSale?: boolean) => {
            const currentPrice = onSale && salePrice != null ? salePrice : basePrice;
            const discountPercentage = onSale && salePrice != null ? Math.round(((basePrice - salePrice) / basePrice) * 100) : 0;
            return (
                <Box display="flex" flexDirection="column" alignItems="flex-end">
                    {onSale && salePrice != null && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label={`-${discountPercentage}%`} size="small" sx={(theme) => ({ bgcolor: theme.palette.error.main, color: 'white', fontWeight: 'bold' })} />
                            <Typography sx={{ textDecoration: 'line-through', color: 'grey.500', fontSize: '0.8rem' }}>{currencyFormatter.format(basePrice)}</Typography>
                        </Box>
                    )}
                    <Typography variant="h6" color={onSale && salePrice != null ? 'success.main' : 'inherit'} fontWeight="bold">{currencyFormatter.format(currentPrice)}</Typography>
                </Box>
            );
        };

        const renderActionButtons = (editionId?: string, dlcId?: string, size: 'small' | 'large' = 'small') => {
            if (isOwned(editionId, dlcId)) {
                return (
                    <Button variant="contained" disabled startIcon={<CheckCircleIcon />} size={size} fullWidth={size === 'large'}>
                        In Library
                    </Button>
                );
            }

            const actionId = editionId || dlcId || 'base';
            const alreadyInCart = isInCart(editionId, dlcId);

            return (
                <Box display="flex" flexDirection={size === 'large' ? 'column' : 'row'} gap={size === 'large' ? 1 : 2}>
                    {alreadyInCart ? (
                        <NextLink href="/cart" passHref>
                            <Button variant="contained" color="secondary" size={size} fullWidth={size === 'large'}>Go to Cart</Button>
                        </NextLink>
                    ) : (
                        <Button
                            variant="contained"
                            color={size === 'large' ? 'success' : 'primary'}
                            size={size}
                            onClick={() => handleAddToCart(editionId, dlcId)}
                            disabled={isAddingToCart && loadingActionId === actionId}
                            fullWidth={size === 'large'}
                        >
                            {isAddingToCart && loadingActionId === actionId ? 'Adding...' : 'Add to Cart'}
                        </Button>
                    )}
                    <Button variant="outlined" size={size} onClick={() => handleBuyNow(editionId, dlcId)} fullWidth={size === 'large'}>
                        Buy Now
                    </Button>
                </Box>
            );
        };

        return (
            <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                {/* === LEFT COLUMN: Main Content === */}
                <Box sx={{ flex: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary.main">{game.title}</Typography>
                    {game.trailer && (
                        <Paper elevation={3} sx={{ mb: 3, bgcolor: '#15202b' }}>
                            <Box component="video" src={game.trailer} controls sx={{ width: '100%', height: 'auto', display: 'block', borderRadius: 1 }} />
                            <Box sx={{ p: 2 }}>
                                <Button variant="contained" fullWidth onClick={() => handleOpenViewer('video', game.trailer!)}>Watch Trailer Fullscreen</Button>
                            </Box>
                        </Paper>
                    )}
                    {game.screenshots && game.screenshots.length > 0 && (
                        <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: '#15202b' }}>
                            <Typography variant="h5" component="h2" gutterBottom>Screenshots</Typography>
                            <ImageList cols={3} rowHeight={164} gap={8}>
                                {game.screenshots.map((item) => (
                                    <ImageListItem key={item}>
                                        <img src={item} alt={`Screenshot of ${game.title}`} loading="lazy" onClick={() => handleOpenViewer('image', item)} style={{ cursor: 'pointer', borderRadius: 4 }} />
                                    </ImageListItem>
                                ))}
                            </ImageList>
                        </Paper>
                    )}
                    {game.editions && game.editions.length > 0 && (
                        <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: '#15202b' }}>
                            <Typography variant="h5" component="h2" gutterBottom>Game Editions</Typography>
                            {game.editions.map(edition => (
                                <Box key={edition._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Typography variant="h6" color="white">{edition.name}</Typography>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Typography variant="body1" fontWeight="bold">{currencyFormatter.format(edition.price)}</Typography>
                                        {renderActionButtons(edition._id)}
                                    </Box>
                                </Box>
                            ))}
                        </Paper>
                    )}
                    {game.dlcs && game.dlcs.length > 0 && (
                        <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: '#15202b' }}>
                            <Typography variant="h5" component="h2" gutterBottom>Downloadable Content (DLC)</Typography>
                            {game.dlcs.map(dlc => (
                                <Box key={dlc._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Typography variant="h6" color="white">{dlc.title}</Typography>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Typography variant="body1" fontWeight="bold">{currencyFormatter.format(dlc.price)}</Typography>
                                        {renderActionButtons(undefined, dlc._id)}
                                    </Box>
                                </Box>
                            ))}
                        </Paper>
                    )}
                    <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: '#15202b' }}>
                        <Typography variant="h5" component="h2" gutterBottom>About This Game</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{game.description || 'No description available.'}</Typography>
                    </Paper>
                    {game.systemRequirements && (
                        <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: '#15202b' }}>
                            <Typography variant="h5" component="h2" gutterBottom>System Requirements</Typography>
                            <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
                                <Box flex={1}><Typography variant="h6" color="primary.main">Minimum</Typography><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{game.systemRequirements.minimum}</Typography></Box>
                                <Box flex={1}><Typography variant="h6" color="primary.main">Recommended</Typography><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{game.systemRequirements.recommended}</Typography></Box>
                            </Box>
                        </Paper>
                    )}
                    <Paper elevation={3} sx={{ p: 3, mt: 3, bgcolor: '#15202b' }}>
                        <Typography variant="h5" component="h2" gutterBottom>
                            Customer Reviews
                        </Typography>
                        {reviewsData && reviewsData.reviews.length > 0 ? (
                            reviewsData.reviews.map(review => (
                                <Box key={review._id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Avatar src={review.user.profile?.profilePic} sx={{ width: 32, height: 32 }}/>
                                        <Typography fontWeight="bold">{review.user.name}</Typography>
                                    </Box>
                                    <Rating value={review.rating} readOnly size="small" sx={{ my: 1 }} />
                                    <Typography variant="body2">{review.comment}</Typography>
                                </Box>
                            ))
                        ) : (
                            <Typography color="text.secondary">No reviews yet for this game.</Typography>
                        )}
                        <NextLink href={`/reviews/${gameId}`} passHref>
                           <Button sx={{ mt: 2 }}>Show All {reviewsData?.totalReviews || 0} Reviews</Button>
                        </NextLink>
                    </Paper>
                </Box>

                {/* === RIGHT COLUMN: Sidebar === */}
                <Box sx={{ flex: 1, mt: 6.6 }}>
                    <Paper elevation={3} sx={{ mb: 3 }}><Box component="img" src={game.coverImage} alt={`${game.title} Cover`} sx={{ width: '100%', height: 'auto', display: 'block', borderRadius: 1 }} /></Paper>
                    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h5" component="h2" mb={1} color="white">{game.title}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}><strong>Developer:</strong> <Link href={`/developer/${game.developer._id}`} color="primary">{game.developer.firstName} {game.developer.lastName}</Link></Typography>
                        {game.releaseDate && (<Typography variant="body2" sx={{ mb: 1 }}><strong>Release Date:</strong> {new Date(game.releaseDate).toLocaleDateString()}</Typography>)}
                        <Box display="flex" flexWrap="wrap" gap={0.5} mt={1} mb={1}><Typography variant="body2" component="strong">Genre:</Typography>{Array.isArray(game.genre) && game.genre.length > 0 ? (game.genre.map((g, index) => (<React.Fragment key={g._id}><Link href={`/genres/${g._id}`} color="primary" variant="body2">{g.name}</Link>{index < game.genre.length - 1 && <Typography variant="body2">, </Typography>}</React.Fragment>))) : (<Typography variant="body2" sx={{ ml: 0.5 }}>N/A</Typography>)}</Box>
                        <Box display="flex" flexWrap="wrap" gap={1} mt={1}><Typography variant="body2" component="strong">Tags:</Typography>{game.tags.map(tag => (<Chip key={tag._id} label={tag.name} size="small" sx={{ bgcolor: 'rgba(102, 192, 244, 0.2)', color: 'primary.main', fontSize: '0.7rem' }} />))}</Box>
                        <NextLink href={`/forum/game/${game._id}`} passHref legacyBehavior>
                            <Button
                                component="a"
                                variant="outlined"
                                fullWidth
                                sx={{ mt: 2 }}
                            >
                                Community Hub
                            </Button>
                        </NextLink>
                    </Paper>
                    <Paper elevation={3} sx={{ p: 2, mb: 3, bgcolor: '#15202b' }}>
                        <Typography variant="h6" component="h3" gutterBottom color="white">Buy {game.title}</Typography>
                        <Box display="flex" flexDirection="column" gap={1}>
                            <Box display="flex" alignItems="center" justifyContent="space-between"><Typography variant="body1" color="secondary.main">Base Game</Typography>{renderPrice(game.basePrice, game.salePrice, game.onSale)}</Box>
                            {renderActionButtons(undefined, undefined, 'large')}
                            <Button variant="text" size="small" fullWidth onClick={handleWishlistToggle} disabled={isInWishlist} sx={{ justifyContent: 'center' }}>{isInWishlist ? '✓ In Wishlist' : '+ Add to your Wishlist'}</Button>
                        </Box>
                    </Paper>
                    <Paper elevation={3} sx={{ p: 2, mb: 3, bgcolor: '#15202b' }}>
                        <Typography variant="h6" component="h3" gutterBottom color="white">
                            Customer Reviews
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Rating name="game-rating-display" value={game.averageRating} precision={0.1} readOnly size="small" />
                            <Typography variant="body2" color="secondary.main">
                                {game.averageRating.toFixed(1)} out of 5
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="secondary.main">
                            Total Reviews: {game.totalReviews}
                        </Typography>
                        
                        {/* Logic to show Add, Edit, or Delete review buttons */}
                        {existingReview ? (
                             <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                <Button variant="outlined" size="small" fullWidth onClick={() => setReviewModalOpen(true)}>Edit Your Review</Button>
                                <Button variant="outlined" color="error" size="small" onClick={handleDeleteReview}>Delete</Button>
                             </Box>
                        ) : (
                            <Button variant="outlined" size="small" sx={{ mt: 2 }} fullWidth onClick={() => setReviewModalOpen(true)}>
                                Write a Review
                            </Button>
                        )}
                    </Paper>
                </Box>

                {/* Full-screen Viewer Dialog */}
                <Dialog open={openViewer} onClose={handleCloseViewer} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: 'rgba(0,0,0,0.8)', boxShadow: 'none' } }}>
                    <IconButton aria-label="close" onClick={handleCloseViewer} sx={{ position: 'absolute', right: 8, top: 8, color: 'white', zIndex: 2, }}><CloseIcon /></IconButton>
                    <DialogContent sx={{ p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {viewerContent?.type === 'image' && (<Box component="img" src={viewerContent.url} alt="Fullscreen" sx={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }} />)}
                        {viewerContent?.type === 'video' && (<Box component="video" src={viewerContent.url} controls autoPlay sx={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }} />)}
                    </DialogContent>
                </Dialog>
            </Box>
        );
    };

    return (
        <>
            <Head><title>{game?.title || 'Loading...'} on LaggedOut</title></Head>
            <Box sx={{ display: 'flex', bgcolor: "#182838", minHeight: '100vh' }}>
                <Sidebar categories={categories} />
                <Box component="main" sx={{ flexGrow: 1, marginLeft: '240px', p: 4 }}>
                    <Container maxWidth="lg" disableGutters>{renderContent()}</Container>
                </Box>
            </Box>
            {gameId && (
                <ReviewEditorModal
                    open={isReviewModalOpen}
                    onClose={() => setReviewModalOpen(false)}
                    gameId={gameId}
                    existingReview={existingReview}
                />
            )}
        </>
    );
};

export default GamePage;