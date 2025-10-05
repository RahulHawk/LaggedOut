import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress } from '@mui/material';
import { useAdminMutations } from '@/customHooks/admin.hooks.query';

interface BanUserModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  action: 'ban' | 'unban';
}

type FormValues = {
  reason: string;
};

export const BanUserModal: React.FC<BanUserModalProps> = ({ open, onClose, userId, userName, action }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();
  const { banUser, unbanUser, isBanningUser, isUnbanningUser } = useAdminMutations();
  const isLoading = isBanningUser || isUnbanningUser;

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      if (action === 'ban') {
        await banUser({ userId, payload: data });
      } else {
        await unbanUser({ userId, payload: data });
      }
      reset();
      onClose();
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{action === 'ban' ? 'Ban User' : 'Unban User'}: {userName}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <TextField
            autoFocus
            label="Reason"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            {...register('reason', { required: 'A reason is required.' })}
            error={!!errors.reason}
            helperText={errors.reason?.message}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" variant="contained" color={action === 'ban' ? 'error' : 'success'} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : `Confirm ${action}`}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};