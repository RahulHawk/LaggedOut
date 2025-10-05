import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { Tag } from '@/typescript/homeTypes';

interface TagFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (name: string) => void;
    initialData?: Tag | null;
}

export const TagFormModal: React.FC<TagFormModalProps> = ({ open, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (initialData) setName(initialData.name);
        else setName('');
    }, [initialData, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(name);
    };

    return (
        <Dialog open={open} onClose={onClose} PaperProps={{ component: 'form', onSubmit: handleSubmit }}>
            <DialogTitle>{initialData ? 'Edit Tag' : 'Add New Tag'}</DialogTitle>
            <DialogContent>
                <TextField autoFocus required margin="dense" label="Tag Name" type="text" fullWidth variant="standard" value={name} onChange={(e) => setName(e.target.value)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="submit">Save</Button>
            </DialogActions>
        </Dialog>
    );
};