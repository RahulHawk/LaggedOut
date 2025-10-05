import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { Genre } from '@/typescript/homeTypes';

interface GenreFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (name: string) => void;
    initialData?: Genre | null; // Pass a genre object here when editing
}

export const GenreFormModal: React.FC<GenreFormModalProps> = ({ open, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        // If initialData is provided (i.e., we are editing), pre-fill the form
        if (initialData) {
            setName(initialData.name);
        } else {
            setName(''); // Otherwise, clear the form for adding
        }
    }, [initialData, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(name);
    };

    return (
        <Dialog open={open} onClose={onClose} PaperProps={{ component: 'form', onSubmit: handleSubmit }}>
            <DialogTitle>{initialData ? 'Edit Genre' : 'Add New Genre'}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="name"
                    label="Genre Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="submit">Save</Button>
            </DialogActions>
        </Dialog>
    );
};