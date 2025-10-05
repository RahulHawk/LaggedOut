import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useGameMutations } from '@/customHooks/gameDev.hooks.query';
import { Dlc } from '@/typescript/gameTypes';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, CircularProgress, TextField } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

interface DlcFormData {
  title: string;
  description: string;
  price: number;
  releaseDate: string;
  systemRequirements: {
    minimum: string;
    recommended: string;
  };
  coverImage: FileList;
  screenshots: FileList;
  trailer: FileList;
  avatar: FileList;
}

interface DlcFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  dlcToEdit?: Dlc | null;
}

export const DlcFormModal: React.FC<DlcFormModalProps> = ({ isOpen, onClose, gameId, dlcToEdit }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DlcFormData>();
  const { addDLC, updateDLC, isAddingDLC, isUpdatingDLC } = useGameMutations();
  const isEditMode = !!dlcToEdit;
  const isLoading = isAddingDLC || isUpdatingDLC;

  useEffect(() => {
    if (dlcToEdit && isOpen) {
      reset({
        title: dlcToEdit.title,
        description: dlcToEdit.description || '',
        price: dlcToEdit.price,
        releaseDate: dlcToEdit.releaseDate ? new Date(dlcToEdit.releaseDate).toISOString().split('T')[0] : '',
        systemRequirements: {
          minimum: dlcToEdit.systemRequirements?.minimum || '',
          recommended: dlcToEdit.systemRequirements?.recommended || '',
        },
      });
    } else if (!isOpen) {
        reset();
    }
  }, [isOpen, dlcToEdit, reset]);
  
  // FIX: Restored the complete onSubmit function definition
  const onSubmit: SubmitHandler<DlcFormData> = async (data) => {
    const payload: Record<string, any> = {
      title: data.title,
      description: data.description,
      price: data.price,
      releaseDate: data.releaseDate,
      systemRequirements: JSON.stringify(data.systemRequirements),
    };

    if (data.coverImage?.length > 0) payload.coverImage = data.coverImage[0];
    if (data.screenshots?.length > 0) payload.screenshots = Array.from(data.screenshots);
    if (data.trailer?.length > 0) payload.trailer = data.trailer[0];
    if (data.avatar?.length > 0) payload.avatar = data.avatar[0];

    try {
      if (isEditMode && dlcToEdit) {
        // FIX: Added the missing call to the updateDLC mutation
        await updateDLC({ gameId, dlcId: dlcToEdit._id, data: payload });
      } else {
        // FIX: Added the missing call to the addDLC mutation
        await addDLC({ gameId, data: payload });
      }
      onClose();
    } catch (error) {
      console.error("Failed to save DLC:", error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEditMode ? 'Edit DLC' : 'Add New DLC'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            <Box sx={{ width: { xs: '100%', md: 'calc(66.66% - 8px)' } }}>
              <TextField label="Title" variant="outlined" fullWidth {...register('title', { required: 'Title is required' })} error={!!errors.title} helperText={errors.title?.message} />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(33.33% - 8px)' } }}>
              <TextField label="Price ($)" type="number" variant="outlined" fullWidth {...register('price', { required: true, valueAsNumber: true, min: 0 })} />
            </Box>
            <Box sx={{ width: '100%' }}>
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
            
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 8px)' } }}>
              <Button component="label" variant="outlined" fullWidth startIcon={<UploadFileIcon />}> Cover Image <input type="file" hidden {...register('coverImage')} /></Button>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 8px)' } }}>
              <Button component="label" variant="outlined" fullWidth startIcon={<UploadFileIcon />}> Screenshots <input type="file" hidden {...register('screenshots')} multiple /></Button>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 8px)' } }}>
              <Button component="label" variant="outlined" fullWidth startIcon={<UploadFileIcon />}> Trailer <input type="file" hidden {...register('trailer')} /></Button>
            </Box>
             <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 8px)' } }}>
              <Button component="label" variant="outlined" fullWidth startIcon={<UploadFileIcon />}> Bonus Avatar <input type="file" hidden {...register('avatar')} /></Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={onClose} color="secondary" disabled={isLoading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Save DLC'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};