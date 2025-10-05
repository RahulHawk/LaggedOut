import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem,
    FormControl, InputLabel, TextField, CircularProgress
} from '@mui/material';
import { useRequestRefundMutation } from '@/customHooks/refund.hooks.query';
import { Purchase } from '@/typescript/commerceTypes';

interface RefundRequestModalProps {
    open: boolean;
    onClose: () => void;
    purchases: Purchase[];
}

export const RefundRequestModal = ({ open, onClose, purchases }: RefundRequestModalProps) => {
    const [selectedPurchaseId, setSelectedPurchaseId] = useState('');
    const [reason, setReason] = useState('');

    const { mutate: requestRefund, isPending } = useRequestRefundMutation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPurchaseId || !reason) {
            alert('Please select a game and provide a reason.');
            return;
        }
        requestRefund({ purchaseId: selectedPurchaseId, reason }, {
            onSuccess: () => {
                onClose();
                setSelectedPurchaseId('');
                setReason('');
            }
        });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ component: 'form', onSubmit: handleSubmit }}>
            <DialogTitle>Request a Refund</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                    <InputLabel id="select-game-label">Select a Purchased Game</InputLabel>
                    <Select
                        labelId="select-game-label"
                        value={selectedPurchaseId}
                        label="Select a Purchased Game"
                        onChange={(e) => setSelectedPurchaseId(e.target.value)}
                        required
                    >
                        {purchases.map(purchase => (
                            <MenuItem key={purchase._id} value={purchase._id}>
                                {purchase.game.title} - {purchase.edition}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    label="Reason for Refund"
                    fullWidth
                    multiline
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={isPending}>
                    {isPending ? <CircularProgress size={24} /> : 'Submit Request'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};