import React from 'react';
import { Box, Typography, CircularProgress, Button, Paper, Divider, Container, Chip } from '@mui/material'; // Added Chip
import Head from 'next/head';
import NextLink from 'next/link';
import { useWishlist, useHomeMutations } from '@/customHooks/misc.hooks.query';
import { WishlistItem } from '@/typescript/homeTypes';
import { Loading } from '@/components/common/Loading';

const getReviewSummary = (rating: number): string => {
  if (rating >= 4.5) return "Overwhelmingly Positive";
  if (rating >= 4.0) return "Very Positive";
  if (rating >= 3.5) return "Mostly Positive";
  if (rating >= 2.5) return "Mixed";
  if (rating >= 1.5) return "Mostly Negative";
  return "N/A";
};

const WishlistPage = () => {
  const { data: wishlist, isLoading, isError } = useWishlist();
  const { removeFromWishlist } = useHomeMutations();

  const currencyFormatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
  });

  const handleRemove = (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation();
    removeFromWishlist(gameId);
  };

  const renderContent = () => {
    if (isLoading) return <Loading />;
    if (isError) return <Typography color="error">Failed to load your wishlist.</Typography>;
    if (!wishlist || wishlist.length === 0) return <Typography>Your wishlist is empty.</Typography>;

    return (
      <Box display="flex" flexDirection="column" gap={2}>
        {wishlist.map((item: WishlistItem) => {
          if (!item.game) return null;

          const game = item.game;
          const addedDate = new Date(item.addedAt).toLocaleDateString();
          const reviewSummary = getReviewSummary(game.averageRating);

          return (
            <NextLink key={game._id} href={`/games/${game._id}`} passHref style={{ textDecoration: 'none' }}>
              <Paper sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                bgcolor: '#2a3a4b', 
                p: 2, 
                color: '#c7d5e0',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: '#3a5a7b'
                }
              }}>
                <Box
                  component="img"
                  src={game.coverImage}
                  alt={game.title}
                  sx={{
                    width: { xs: 80, sm: 120 },
                    height: { xs: 120, sm: 180 },
                    objectFit: 'cover',
                    borderRadius: '4px',
                    flexShrink: 0
                  }}
                />
                <Box sx={{ flexGrow: 1, ml: 2 }}>
                  <Typography variant="h6" color="#fff">{game.title}</Typography>
                  <Typography variant="body2">Overall Reviews: <span style={{ color: '#66c0f4' }}>{reviewSummary}</span></Typography>
                  <Typography variant="caption">Added on {addedDate}</Typography>
                </Box>
                
                {/* --- UPDATED PRICE DISPLAY LOGIC --- */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '120px' }}>
                  {game.onSale && game.salePrice ? (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         <Chip 
                            label={`-${Math.round(((game.basePrice - game.salePrice) / game.basePrice) * 100)}%`}
                            size="small" 
                            sx={(theme) => ({ bgcolor: theme.palette.error.main, color: 'white', fontWeight: 'bold' })} 
                         />
                         <Typography sx={{ textDecoration: 'line-through', color: 'grey.500' }}>
                            {currencyFormatter.format(game.basePrice)}
                         </Typography>
                      </Box>
                      <Typography variant="h6" color="success.main">
                        {currencyFormatter.format(game.salePrice)}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="h6" color="#fff">
                      {currencyFormatter.format(game.basePrice)}
                    </Typography>
                  )}
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    onClick={(e) => handleRemove(e, game._id)}
                    sx={{ mt: 2 }}
                  >
                    Remove
                  </Button>
                </Box>
                {/* --- END OF UPDATE --- */}

              </Paper>
            </NextLink>
          );
        })}
      </Box>
    );
  };

  return (
    <>
      <Head><title>My Wishlist | LaggedOut</title></Head>
      <Box sx={{
        p: 4,
        bgcolor: '#1b2838',
        minHeight: 'calc(100vh - 64px)'
      }}>
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom sx={{ color: '#fff' }}>My Wishlist</Typography>
            <Divider sx={{ mb: 4, bgcolor: '#0f1821' }} />
            {renderContent()}
        </Container>
      </Box>
    </>
  );
};

export default WishlistPage;