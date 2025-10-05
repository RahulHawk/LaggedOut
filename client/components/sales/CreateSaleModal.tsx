import React from 'react';
import { useForm, SubmitHandler, useFieldArray, Controller } from 'react-hook-form';
import { CreateSalePayload } from '@/typescript/saleTypes';
import { Game } from '@/typescript/gameTypes';
import { useSaleMutations } from '@/customHooks/sale.hooks.query';

import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextField,
  IconButton, Select, MenuItem, FormControl, InputLabel, Typography, CircularProgress
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';

interface CreateSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  developerGames: Game[]; // A list of the developer's games to choose from
}

type FormValues = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  games: {
    game: string;
    discount: number;
  }[];
};

export const CreateSaleModal: React.FC<CreateSaleModalProps> = ({ isOpen, onClose, developerGames }) => {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      games: [{ game: '', discount: 10 }],
    },
  });
  
  const { fields, append, remove } = useFieldArray({ control, name: "games" });
  const { createSale, isCreatingSale } = useSaleMutations();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      await createSale(data);
      reset();
      onClose();
    } catch (error) {
      console.error("Failed to create sale:", error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create New Sale</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Sale Title" variant="outlined" fullWidth {...register('title', { required: 'Title is required' })} error={!!errors.title} helperText={errors.title?.message} />
            <TextField label="Description" variant="outlined" fullWidth multiline rows={3} {...register('description')} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Start Date" type="date" variant="outlined" fullWidth {...register('startDate', { required: true })} InputLabelProps={{ shrink: true }} />
              <TextField label="End Date" type="date" variant="outlined" fullWidth {...register('endDate', { required: true })} InputLabelProps={{ shrink: true }} />
            </Box>

            <Typography variant="h6" sx={{ mt: 2, borderBottom: 1, borderColor: 'divider', pb: 1 }}>Games & Discounts</Typography>
            
            {fields.map((item, index) => (
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Select Game</InputLabel>
                  <Controller
                    name={`games.${index}.game`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select {...field} label="Select Game">
                        {developerGames.map((game) => (
                          <MenuItem key={game._id} value={game._id}>{game.title}</MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
                <TextField
                  label="Discount %"
                  type="number"
                  variant="outlined"
                  sx={{ minWidth: 120 }}
                  {...register(`games.${index}.discount`, { required: true, min: 1, max: 99, valueAsNumber: true })}
                />
                <IconButton onClick={() => remove(index)} color="error" disabled={fields.length <= 1}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            <Button
              startIcon={<AddCircleIcon />}
              onClick={() => append({ game: '', discount: 10 })}
              sx={{ alignSelf: 'flex-start' }}
            >
              Add Another Game
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={onClose} color="secondary" disabled={isCreatingSale}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isCreatingSale}>
            {isCreatingSale ? <CircularProgress size={24} /> : 'Create Sale'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};