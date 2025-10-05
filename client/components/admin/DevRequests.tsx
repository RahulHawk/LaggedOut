'use client';

import React from 'react';
import { useGetDevLinkRequests, useAdminMutations } from '@/customHooks/admin.hooks.query';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Box, CircularProgress, Typography } from '@mui/material';

export const DevRequests: React.FC = () => {
  // This component now fetches its own data.
  const { data: devRequests, isLoading } = useGetDevLinkRequests();
  const { approveDevLinkRequest, isApprovingDevLinkRequest } = useAdminMutations();

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Paper>
      <Typography variant="h5" sx={{ p: 2 }}>Developer Registration Requests</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Date Requested</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devRequests && devRequests.length > 0 ? devRequests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>{req.name} ({req.email})</TableCell>
                {/* FIX: Use the correct 'requestedAt' property for the date */}
                <TableCell>{new Date(req.requestedAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  {/* The 'Approve' button is now functional */}
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={() => approveDevLinkRequest(req.id)}
                    disabled={isApprovingDevLinkRequest}
                  >
                    Approve
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No pending developer requests.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};