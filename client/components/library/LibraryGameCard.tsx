import React from 'react';
import { Box, Typography, Paper, IconButton, Tooltip, CircularProgress } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Game } from '@/typescript/homeTypes';

interface LibraryGameCardProps {
  game: Game;
  addedAt: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isAddingFavorite: boolean;
  isRemovingFavorite: boolean;
}

export const LibraryGameCard = ({ game, addedAt, isFavorite, onToggleFavorite, isAddingFavorite, isRemovingFavorite }: LibraryGameCardProps) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the link from navigating
    e.stopPropagation(); // Stop the event from bubbling up
    onToggleFavorite();
  };

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        borderRadius: '8px',
        transform: 'scale(1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'scale(1.03)',
          boxShadow: '0px 10px 20px rgba(0,0,0,0.4)',
        },
        // Target the overlay for the hover effect
        '&:hover .overlay': {
          opacity: 1,
          transform: 'translateY(0)',
        },
      }}
    >
      <Box
        component="img"
        src={game.coverImage}
        alt={game.title}
        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      <Box
        className="overlay" // Class for the hover target
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          color: '#fff',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
          // Initial hidden state
          opacity: 0,
          transform: 'translateY(100%)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        <Typography variant="h6" fontWeight="bold" noWrap>{game.title}</Typography>
        <Typography variant="caption">Added: {new Date(addedAt).toLocaleDateString()}</Typography>
        <Tooltip title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'} placement="top">
          {/* Add the disabled prop here */}
          <IconButton
            onClick={handleFavoriteClick}
            disabled={isAddingFavorite || isRemovingFavorite} // Disable if either is pending
            sx={{
              position: 'absolute', top: 8, right: 8,
              backgroundColor: 'rgba(0,0,0,0.5)',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
            }}
          >
            {(isAddingFavorite || isRemovingFavorite) ? (
                <CircularProgress size={24} sx={{ color: '#fff' }} />
            ) : isFavorite ? (
                <FavoriteIcon sx={{ color: '#e04f5f' }} />
            ) : (
                <FavoriteBorderIcon sx={{ color: '#fff' }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};