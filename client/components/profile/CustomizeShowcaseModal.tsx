import { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button, FormGroup, FormControlLabel, Checkbox, CircularProgress } from '@mui/material';
import { useUpdateProfileMutation } from '@/customHooks/profile.hooks.query';
import type { ShowcaseGame } from '@/typescript/profileTypes';

interface CustomizeShowcaseModalProps {
  open: boolean;
  handleClose: () => void;
  library: ShowcaseGame[];
  showcaseGames: ShowcaseGame[];
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', md: 600 },
  bgcolor: '#1f2a38',
  border: '2px solid #66c0f4',
  boxShadow: 24,
  p: 4,
  color: '#fff',
  maxHeight: '90vh',
  overflowY: 'auto'
};

const SHOWCASE_LIMIT = 4;

export const CustomizeShowcaseModal = ({ open, handleClose, library, showcaseGames }: CustomizeShowcaseModalProps) => {
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const updateProfileMutation = useUpdateProfileMutation();

  useEffect(() => {
    if (open && showcaseGames) {
      setSelectedGames(showcaseGames.map(g => g._id));
    }
  }, [open, showcaseGames]);

  const handleSelectGame = (gameId: string) => {
    setSelectedGames(prev => {
      if (prev.includes(gameId)) {
        return prev.filter(id => id !== gameId); // Deselect
      }
      if (prev.length < SHOWCASE_LIMIT) {
        return [...prev, gameId]; // Select
      }
      return prev; // Limit reached
    });
  };

  const handleSave = () => {
    updateProfileMutation.mutate({ showcaseGames: selectedGames }, {
      onSuccess: handleClose,
    });
  };

  const handleReset = () => {
    updateProfileMutation.mutate({ showcaseGames: [] }, { 
      onSuccess: handleClose,
    });
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h5" mb={2}>Customize Showcase</Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>Select up to {SHOWCASE_LIMIT} games to feature on your profile.</Typography>
        <FormGroup sx={{ maxHeight: '40vh', overflowY: 'auto', pr: 1 }}>
          {library.map(game => (
            <FormControlLabel 
              key={game._id}
              control={
                <Checkbox 
                  checked={selectedGames.includes(game._id)} 
                  onChange={() => handleSelectGame(game._id)}
                  disabled={!selectedGames.includes(game._id) && selectedGames.length >= SHOWCASE_LIMIT}
                />
              } 
              label={game.title} 
            />
          ))}
        </FormGroup>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" color="error" onClick={handleReset} disabled={updateProfileMutation.isPending}>
              Reset Showcase
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? <CircularProgress size={24} /> : 'Save Showcase'}
            </Button>
        </Box>
      </Box>
    </Modal>
  );
};