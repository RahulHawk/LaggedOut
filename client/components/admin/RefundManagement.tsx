'use client';

import React from 'react';
import { useAllRefundsQuery, useReviewRefundMutation } from '@/customHooks/refund.hooks.query';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Button,
    Chip,
    Alert
} from '@mui/material';
import { format } from 'date-fns';

// A helper function to determine the chip color based on status
const getStatusChipColor = (status: string) => {
    switch (status) {
        case 'approved':
            return 'success';
        case 'rejected':
            return 'error';
        case 'pending':
        default:
            return 'warning';
    }
};

export function RefundManagement() {
    // Fetch all refund requests using the custom hook
    const { data: refunds, isLoading, isError } = useAllRefundsQuery();

    // Get the mutation function and its loading state for reviewing refunds
    const { mutate: reviewRefund, isPending: isReviewing } = useReviewRefundMutation();

    const handleReview = (refundId: string, status: 'approved' | 'rejected') => {
        reviewRefund({ refundId, payload: { status } });
    };

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
    }

    if (isError) {
        return <Alert severity="error">Failed to load refund requests. Please try again later.</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Refund Management
            </Typography>
            {refunds && refunds.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="refunds table">
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Game</TableCell>
                                <TableCell>Reason</TableCell>
                                <TableCell>Requested On</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {refunds.map((refund) => (
                                <TableRow key={refund._id}>
                                    <TableCell>{refund.user?.email || 'N/A'}</TableCell>
                                    <TableCell>{refund.purchase?.game?.title || 'N/A'}</TableCell>
                                    <TableCell>{refund.reason}</TableCell>
                                    {/* FIX: Check if createdAt exists before formatting */}
                                    <TableCell>
                                        {refund.createdAt ? format(new Date(refund.createdAt), 'PPpp') : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={refund.status}
                                            color={getStatusChipColor(refund.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        {refund.status === 'pending' ? (
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    onClick={() => handleReview(refund._id, 'approved')}
                                                    disabled={isReviewing}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleReview(refund._id, 'rejected')}
                                                    disabled={isReviewing}
                                                >
                                                    Reject
                                                </Button>
                                            </Box>
                                        ) : (
                                            <Typography variant="caption" color="text.secondary">
                                                {/* FIX: Check if reviewedAt exists before formatting */}
                                                Reviewed by {refund.reviewedBy?.userName || 'Admin'} on{' '}
                                                {refund.reviewedAt ? format(new Date(refund.reviewedAt), 'P') : ''}
                                            </Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography>No refund requests found.</Typography>
            )}
        </Box>
    );
}