import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    CircularProgress,
    // Note: To populate the Badge dropdown, you would need a useAllBadgesQuery hook.
    // For now, we will use a simple text input for the badgeId.
} from '@mui/material';
import { useCreateAchievementMutation } from '@/customHooks/achievement.hooks.query';

interface CreateAchievementModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateAchievementModal = ({ open, onClose }: CreateAchievementModalProps) => {
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    condition: '',
    badgeId: '',
  });

  const { mutate: createAchievement, isPending } = useCreateAchievementMutation();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.name || !formState.condition) {
      alert("Achievement name and condition are required.");
      return;
    }
    
    createAchievement(formState, {
        onSuccess: () => {
            onClose();
            setFormState({ name: '', description: '', condition: '', badgeId: '' });
        }
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Achievement</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Achievement Name"
            name="name"
            type="text"
            fullWidth
            variant="outlined"
            value={formState.name}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formState.description}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Condition Key"
            name="condition"
            type="text"
            fullWidth
            variant="outlined"
            value={formState.condition}
            onChange={handleChange}
            required
            helperText="e.g., 'buy_5_games', 'first_purchase'"
          />
          <TextField
            margin="dense"
            label="Associated Badge ID (Optional)"
            name="badgeId"
            type="text"
            fullWidth
            variant="outlined"
            value={formState.badgeId}
            onChange={handleChange}
            helperText="Paste the ID of a pre-existing badge."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? <CircularProgress size={24} /> : 'Create Achievement'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};