'use client';

import React from 'react';
import { useGetAllGames, useGameMutations } from '@/customHooks/gameDev.hooks.query';
import { Game } from '@/typescript/gameTypes';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  CircularProgress,
  Chip // Import Chip for status display
} from '@mui/material';

export const GameManagement = () => {
  const { data: allGames = [], isLoading, isError } = useGetAllGames({ showAll: true });
  const { approveGame, isApprovingGame } = useGameMutations();

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (isError) {
    return <Typography color="error" align="center">Failed to load games.</Typography>;
  }

  return (
    <Paper>
      <Typography variant="h5" sx={{ p: 2 }}>Game Management</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Game Title</TableCell>
              <TableCell>Developer</TableCell>
              <TableCell>Status</TableCell> {/* FIX: Added Status column */}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allGames.length > 0 ? allGames.map((game: Game) => (
              <TableRow key={game._id}>
                <TableCell>{game.title}</TableCell>
                <TableCell>{game.developer?.firstName || 'N/A'}</TableCell>
                <TableCell>
                  {/* FIX: Display status using a Chip */}
                  {game.approved ? (
                    <Chip label="Approved" color="success" size="small" />
                  ) : (
                    <Chip label="Pending" color="warning" size="small" />
                  )}
                </TableCell>
                <TableCell align="right">
                  {/* FIX: Only show the Approve button if the game is not yet approved */}
                  {!game.approved && (
                    <Button
                      variant="contained"
                      size="small"
                      color="success"
                      onClick={() => approveGame(game._id)}
                      disabled={isApprovingGame}
                    >
                      Approve
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No games found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};