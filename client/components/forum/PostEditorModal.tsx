import React, { useState, useEffect } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    CircularProgress,
    FormControlLabel,
    Switch,
} from '@mui/material';
import { useCreatePostMutation, useUpdatePostMutation } from '@/customHooks/forum.hooks.query';
import { CreatePostPayload, Post, UpdatePostPayload } from '@/typescript/forumTypes';

interface PostEditorModalProps {
  open: boolean;
  onClose: () => void;
  gameId: string;
  postToEdit?: Post | null;
}

export const PostEditorModal = ({ open, onClose, gameId, postToEdit }: PostEditorModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  
  const isEditing = !!postToEdit;

  // Pre-fill the form if we are editing an existing post
  useEffect(() => {
    if (isEditing) {
      setTitle(postToEdit.title);
      setContent(postToEdit.content);
      setIsAnnouncement(postToEdit.type === 'announcement');
    } else {
      // Reset form for creating a new post
      setTitle('');
      setContent('');
      setIsAnnouncement(false);
    }
  }, [postToEdit, open]);

  const { mutate: createPost, isPending: isCreating } = useCreatePostMutation(gameId);
  const { mutate: updatePost, isPending: isUpdating } = useUpdatePostMutation(gameId, postToEdit?._id || '');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (isEditing) {
        const updatePayload = {
            title,
            content,
            type: isAnnouncement ? 'announcement' : 'discussion',
        } as UpdatePostPayload;

        updatePost(updatePayload, { onSuccess: onClose });

    } else {
        const createPayload = {
            game: gameId,
            title,
            content,
            type: isAnnouncement ? 'announcement' : 'discussion',
        } as CreatePostPayload

        createPost(createPayload, { onSuccess: onClose });
    }
};

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEditing ? 'Edit Post' : 'Create a New Post'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Post Title"
            type="text"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Content"
            type="text"
            fullWidth
            multiline
            rows={10}
            variant="outlined"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          {/* Note: You would add a check here to only show this for admins/developers */}
          <FormControlLabel
            control={<Switch checked={isAnnouncement} onChange={(e) => setIsAnnouncement(e.target.checked)} />}
            label="Make this an announcement"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? <CircularProgress size={24} /> : (isEditing ? 'Save Changes' : 'Create Post')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};