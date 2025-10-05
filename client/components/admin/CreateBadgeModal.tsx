import React, { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    CircularProgress,
    Typography,
} from '@mui/material';
import { useCreateBadgeMutation } from '@/customHooks/achievement.hooks.query';

interface CreateBadgeModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateBadgeModal = ({ open, onClose }: CreateBadgeModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { mutate: createBadge, isPending } = useCreateBadgeMutation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !imageFile) {
      alert("Badge name and image are required.");
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('image', imageFile);

    createBadge(formData, {
      onSuccess: () => {
        onClose(); // Close the modal on success
        // Reset form
        setName('');
        setDescription('');
        setImageFile(null);
        setPreview(null);
      }
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Badge</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Badge Name"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mt: 2 }}
          >
            Upload Badge Image
            <input
              type="file"
              hidden
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
            />
          </Button>
          {preview && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption">Image Preview:</Typography>
              <Box 
                component="img" 
                src={preview} 
                alt="Badge preview" 
                sx={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', mt: 1 }} 
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? <CircularProgress size={24} /> : 'Create Badge'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};