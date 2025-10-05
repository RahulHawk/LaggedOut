import React, { useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useGameMutations } from '@/customHooks/gameDev.hooks.query';
import { Edition, Dlc } from '@/typescript/gameTypes';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  TextField,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

interface EditionFormData {
  name: string;
  description: string;
  price: number;
  includesDLCs: string[];
  coverImage: FileList;
  avatar: FileList;
}

interface EditionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  availableDlcs: Dlc[];
  editionToEdit?: Edition | null;
}

export const EditionFormModal: React.FC<EditionFormModalProps> = ({ isOpen, onClose, gameId, availableDlcs, editionToEdit }) => {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<EditionFormData>();
  const { addEdition, updateEdition, isAddingEdition, isUpdatingEdition } = useGameMutations();

  const isEditMode = !!editionToEdit;
  const isLoading = isAddingEdition || isUpdatingEdition;

  useEffect(() => {
    if (editionToEdit && isOpen) {
        reset({
            name: editionToEdit.name,
            description: editionToEdit.description || '',
            price: editionToEdit.price,
            includesDLCs: editionToEdit.includesDLCs || [],
        });
    } else if (!isOpen) {
        reset();
    }
  }, [isOpen, editionToEdit, reset]);

  // FIX: Restored the complete onSubmit function definition
  const onSubmit: SubmitHandler<EditionFormData> = async (data) => {
    const payload: Record<string, any> = {
      name: data.name,
      description: data.description,
      price: data.price,
      includesDLCs: JSON.stringify(data.includesDLCs),
    };
    if (data.coverImage?.length > 0) payload.coverImage = data.coverImage[0];
    if (data.avatar?.length > 0) payload.avatar = data.avatar[0];

    try {
      if (isEditMode && editionToEdit) {
        // FIX: Added the missing call to the updateEdition mutation
        await updateEdition({ gameId, editionId: editionToEdit._id, data: payload });
      } else {
        // FIX: Added the missing call to the addEdition mutation
        await addEdition({ gameId, data: payload });
      }
      onClose();
    } catch (error) {
      console.error("Failed to save Edition:", error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditMode ? 'Edit Edition' : 'Add New Edition'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            <Box sx={{ width: { xs: '100%', md: 'calc(66.66% - 8px)' } }}>
              <TextField label="Edition Name" variant="outlined" fullWidth {...register('name', { required: true })} error={!!errors.name} helperText={errors.name?.message} />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(33.33% - 8px)' } }}>
              <TextField label="Price ($)" type="number" variant="outlined" fullWidth {...register('price', { required: true, valueAsNumber: true, min: 0 })} />
            </Box>
            <Box sx={{ width: '100%' }}>
              <TextField label="Description" variant="outlined" fullWidth multiline rows={4} {...register('description')} />
            </Box>
            <Box sx={{ width: '100%' }}>
              <FormControl fullWidth>
                <InputLabel id="dlc-select-label">Includes DLCs</InputLabel>
                <Controller
                  name="includesDLCs"
                  control={control}
                  defaultValue={editionToEdit?.includesDLCs || []}
                  render={({ field }) => (
                    <Select {...field} labelId="dlc-select-label" multiple input={<OutlinedInput label="Includes DLCs" />}>
                      {(availableDlcs || []).map((dlc) => (
                        <MenuItem key={dlc._id} value={dlc._id}>{dlc.title}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
              <Button component="label" variant="outlined" fullWidth startIcon={<UploadFileIcon />}>
                Cover Image
                <input type="file" hidden accept="image/*" {...register('coverImage')} />
              </Button>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
              <Button component="label" variant="outlined" fullWidth startIcon={<UploadFileIcon />}>
                Bonus Avatar
                <input type="file" hidden accept="image/*" {...register('avatar')} />
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={onClose} color="secondary" disabled={isLoading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Save Edition'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};