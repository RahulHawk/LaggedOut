import React, { useEffect, useState } from 'react'; // <-- Import useState
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useGameMutations } from '@/customHooks/gameDev.hooks.query';
import { Game, Genre, Tag } from '@/typescript/gameTypes';

import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  CircularProgress, TextField, FormControl, InputLabel, Select, MenuItem,
  OutlinedInput, Chip, IconButton // <-- Import IconButton
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete'; // <-- Import DeleteIcon

interface GameFormData {
  title: string;
  description: string;
  basePrice: number;
  websiteUrl: string;
  releaseDate: string;
  systemRequirements: {
    minimum: string;
    recommended: string;
  };
  genre: string[];
  tags: string[];
  coverImage: FileList;
  screenshots: FileList;
  trailer: FileList;
  avatar: FileList;
}

interface GameFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameToEdit?: Game | null;
  availableGenres: Genre[];
  availableTags: Tag[];
}

export const GameFormModal: React.FC<GameFormModalProps> = ({ isOpen, onClose, gameToEdit, availableGenres, availableTags }) => {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<GameFormData>();
  const { createGame, updateGame, isCreatingGame, isUpdatingGame } = useGameMutations();

  // --- NEW: State to track which media items to remove ---
  const [removedMedia, setRemovedMedia] = useState<{
    coverImage: boolean;
    trailer: boolean;
    screenshots: string[]; // Store URLs of screenshots to be removed
  }>({ coverImage: false, trailer: false, screenshots: [] });

  const isEditMode = !!gameToEdit;
  const isLoading = isCreatingGame || isUpdatingGame;

  useEffect(() => {
    if (isOpen) {
      setRemovedMedia({ coverImage: false, trailer: false, screenshots: [] });

      if (gameToEdit) {
        reset({
          title: gameToEdit.title,
          description: gameToEdit.description || '',
          basePrice: gameToEdit.basePrice,
          websiteUrl: gameToEdit.websiteUrl || '',
          releaseDate: gameToEdit.releaseDate ? new Date(gameToEdit.releaseDate).toISOString().split('T')[0] : '',
          systemRequirements: {
            minimum: gameToEdit.systemRequirements?.minimum || '',
            recommended: gameToEdit.systemRequirements?.recommended || '',
          },
          genre: (gameToEdit.genre ?? []).filter(Boolean).map(g => g._id),
          tags: (gameToEdit.tags ?? []).filter(Boolean).map(t => t._id),
        });
      } else {
        reset();
      }
    }
  }, [isOpen, gameToEdit, reset, availableGenres, availableTags]);

  // --- NEW: Handler to mark a screenshot for removal ---
  const handleRemoveScreenshot = (screenshotUrl: string) => {
    setRemovedMedia(prev => ({
      ...prev,
      screenshots: [...prev.screenshots, screenshotUrl],
    }));
  };

  const onSubmit: SubmitHandler<GameFormData> = async (data) => {
    const payload: Record<string, any> = {
      title: data.title, description: data.description, basePrice: data.basePrice, websiteUrl: data.websiteUrl, releaseDate: data.releaseDate,
      systemRequirements: JSON.stringify(data.systemRequirements),
      genre: JSON.stringify(data.genre),
      tags: JSON.stringify(data.tags),
    };
    if (data.coverImage?.length > 0) payload.coverImage = data.coverImage[0];
    if (data.screenshots?.length > 0) payload.screenshots = Array.from(data.screenshots);
    if (data.trailer?.length > 0) payload.trailer = data.trailer[0];
    if (data.avatar?.length > 0) payload.avatar = data.avatar[0];

    try {
      if (isEditMode && gameToEdit) {
        // --- NEW: Add removal flags to the payload for update operations ---
        const updatePayload = { ...payload };
        if (removedMedia.coverImage) updatePayload.removeCoverImage = true;
        if (removedMedia.trailer) updatePayload.removeTrailer = true;
        if (removedMedia.screenshots.length > 0) {
          updatePayload.removeScreenshots = JSON.stringify(removedMedia.screenshots);
        }
        await updateGame({ id: gameToEdit._id, data: updatePayload });
      } else {
        await createGame(payload);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save game:", error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEditMode ? 'Edit Game' : 'Create New Game'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            {/* --- All form fields (Title, Price, etc.) are unchanged --- */}
            {/* Title, Price, etc. TextFields go here... */}
            <Box sx={{ width: { xs: '100%', md: 'calc(66.66% - 8px)' } }}>
              <TextField label="Title" variant="outlined" fullWidth {...register('title', { required: 'Title is required' })} error={!!errors.title} helperText={errors.title?.message} />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(33.33% - 8px)' } }}>
              <TextField label="Base Price ($)" type="number" variant="outlined" fullWidth {...register('basePrice', { required: true, valueAsNumber: true, min: 0 })} />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
              <TextField label="Website URL" variant="outlined" fullWidth {...register('websiteUrl')} />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
              <TextField label="Release Date" type="date" variant="outlined" fullWidth {...register('releaseDate')} InputLabelProps={{ shrink: true }} />
            </Box>
            <Box sx={{ width: '100%' }}>
              <TextField label="Description" variant="outlined" fullWidth multiline rows={4} {...register('description')} />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
              <TextField label="Minimum System Requirements" variant="outlined" fullWidth multiline rows={4} {...register('systemRequirements.minimum')} />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
              <TextField label="Recommended System Requirements" variant="outlined" fullWidth multiline rows={4} {...register('systemRequirements.recommended')} />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
              <FormControl fullWidth>
                <InputLabel id="genre-select-label">Genres</InputLabel>
                <Controller
                  name="genre"
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="genre-select-label"
                      multiple
                      input={<OutlinedInput label="Genres" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={availableGenres.find(g => g._id === value)?.name} />
                          ))}
                        </Box>
                      )}
                    >
                      {availableGenres.map((genre) => (
                        <MenuItem key={genre._id} value={genre._id}>{genre.name}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
              <FormControl fullWidth>
                <InputLabel id="tag-select-label">Tags</InputLabel>
                <Controller
                  name="tags"
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="tag-select-label"
                      multiple
                      input={<OutlinedInput label="Tags" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={availableTags.find(t => t._id === value)?.name} />
                          ))}
                        </Box>
                      )}
                    >
                      {availableTags.map((tag) => (
                        <MenuItem key={tag._id} value={tag._id}>{tag.name}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Box>

            {/* --- Media Upload Section --- */}
            <Box sx={{ width: '100%', mt: 2 }}><Typography variant="h6" gutterBottom>Media</Typography></Box>

            {/* --- UPDATED: Cover Image --- */}
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 8px)' } }}>
              <Button component="label" variant="outlined" fullWidth startIcon={<UploadFileIcon />}>
                Cover Image <input type="file" hidden accept="image/*" {...register('coverImage', { required: !isEditMode })} />
              </Button>
              {gameToEdit?.coverImage && !removedMedia.coverImage && (
                <Box mt={2} sx={{ position: 'relative', width: 'fit-content' }}>
                  <Typography variant="subtitle2">Current Cover Image</Typography>
                  <img src={gameToEdit.coverImage} alt="Cover" style={{ width: 150, borderRadius: 8 }} />
                  <IconButton
                    size="small"
                    onClick={() => setRemovedMedia(prev => ({ ...prev, coverImage: true }))}
                    sx={{ position: 'absolute', top: 28, right: 4, backgroundColor: 'rgba(255,255,255,0.7)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' } }}
                    aria-label="remove cover image"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>

            {/* --- UPDATED: Screenshots --- */}
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 8px)' } }}>
              <Button component="label" variant="outlined" fullWidth startIcon={<UploadFileIcon />}>
                Screenshots <input type="file" hidden accept="image/*" {...register('screenshots')} multiple />
              </Button>
              {gameToEdit?.screenshots?.length ? (
                <Box mt={2}>
                  <Typography variant="subtitle2">Current Screenshots</Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {gameToEdit.screenshots!
                      .filter(shot => !removedMedia.screenshots.includes(shot)) // Filter out removed shots
                      .map((shot, idx) => (
                        <Box key={idx} sx={{ position: 'relative' }}>
                          <img src={shot} alt={`screenshot-${idx}`} style={{ width: 120, borderRadius: 8 }} />
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveScreenshot(shot)}
                            sx={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(255,255,255,0.7)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' } }}
                            aria-label={`remove screenshot ${idx + 1}`}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                  </Box>
                </Box>
              ) : null}
            </Box>

            {/* --- UPDATED: Trailer --- */}
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 8px)' } }}>
              <Button component="label" variant="outlined" fullWidth startIcon={<UploadFileIcon />}>
                Trailer <input type="file" hidden accept="video/*" {...register('trailer')} />
              </Button>
              {gameToEdit?.trailer && !removedMedia.trailer && (
                <Box mt={2} sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
                  <Typography variant="subtitle2">Current Trailer</Typography>
                  <video src={gameToEdit.trailer} controls style={{ width: "100%", borderRadius: 8 }} />
                  <IconButton
                    size="small"
                    onClick={() => setRemovedMedia(prev => ({ ...prev, trailer: true }))}
                    sx={{ position: 'absolute', top: 28, right: 4, backgroundColor: 'rgba(255,255,255,0.7)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' } }}
                    aria-label="remove trailer"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>

            {/* --- Avatar (Unchanged) --- */}
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 8px)' } }}>
              <Button component="label" variant="outlined" fullWidth startIcon={<UploadFileIcon />}>
                Avatar <input type="file" hidden accept="image/*" {...register('avatar')} />
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={onClose} color="secondary" disabled={isLoading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Save Game'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};