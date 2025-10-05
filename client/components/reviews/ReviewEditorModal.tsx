import React, { useState, useEffect } from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
    CircularProgress, Rating, Typography, Box
} from '@mui/material';
import useReviewMutations from '@/customHooks/review.hooks.query';
import { Review } from '@/typescript/reviewTypes';

interface ReviewEditorModalProps {
  open: boolean;
  onClose: () => void;
  gameId: string;
  existingReview: Review | null;
}

export const ReviewEditorModal = ({ open, onClose, gameId, existingReview }: ReviewEditorModalProps) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  const isEditing = !!existingReview;
  const { addReview, updateReview, deleteReview } = useReviewMutations(gameId);

  // Pre-fill form if editing an existing review
  useEffect(() => {
    if (isEditing) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
    } else {
      setRating(null);
      setComment('');
    }
  }, [existingReview, open]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!rating) {
      alert("Please provide a star rating.");
      return;
    }

    const payload = { rating, comment };
    
    if (isEditing) {
      updateReview({ reviewId: existingReview._id, payload }, { onSuccess: onClose });
    } else {
      addReview({ ...payload, game: gameId }, { onSuccess: onClose });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Edit Your Review' : 'Write a Review'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="legend">Your Rating</Typography>
            <Rating
              name="rating"
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              size="large"
            />
          </Box>
          <TextField
            margin="dense"
            label="Your Comment (Optional)"
            type="text"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEditing ? 'Save Changes' : 'Submit Review'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};