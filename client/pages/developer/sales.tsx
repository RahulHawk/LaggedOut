'use client';

import React, { useState } from 'react'; // No useEffect or useRouter needed for auth
import { useGetAllSales, useSaleMutations } from '@/customHooks/sale.hooks.query';
import { useGetMyGames } from '@/customHooks/gameDev.hooks.query';
import { Sale } from '@/typescript/saleTypes';
import { CreateSaleModal } from '@/components/sales/CreateSaleModal';

import {
  Container, Typography, Button, Box, Card, CardContent, Stack, Divider, Chip,
  CircularProgress, Paper, CardActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';

// Helper function to determine sale status
const getSaleStatus = (sale: Sale): { label: string, color: 'success' | 'warning' | 'default' } => {
  if (sale.isActive) {
    return { label: 'Active', color: 'success' };
  }
  const now = new Date();
  const startDate = new Date(sale.startDate);
  if (startDate > now) {
    return { label: 'Scheduled', color: 'warning' };
  }
  return { label: 'Ended', color: 'default' };
};

export default function ManageSalesPage() {
  // These simple hook calls now work correctly
  const { data: sales = [], isLoading: isSalesLoading, isError } = useGetAllSales();
  const { data: gamesData, isLoading: isGamesLoading } = useGetMyGames();
  const developerGames = gamesData || [];
  
  const { activateSale, deactivateSale, isActivatingSale, isDeactivatingSale } = useSaleMutations();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // A single, combined loading check for both queries
  if (isSalesLoading || isGamesLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }
  
  if (isError) {
    return <Typography color="error" align="center" sx={{p: 4}}>Failed to load sales data.</Typography>
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h1">Manage Sales</Typography>
        <Button onClick={() => setIsModalOpen(true)} variant="contained" startIcon={<AddIcon />}>
          Create New Sale
        </Button>
      </Box>

      <Stack spacing={4}>
        {sales.length > 0 ? sales.map((sale) => {
          const status = getSaleStatus(sale);
          return (
            <Card key={sale._id} elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h2">{sale.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(sale.startDate).toLocaleDateString()} - {new Date(sale.endDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip label={status.label} color={status.color} />
                </Box>
                <Typography variant="body1" sx={{ my: 2 }}>{sale.description}</Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h3" sx={{ mb: 1 }}>Included Games</Typography>
                <Stack spacing={1}>
                  {sale.games.map(g => (
                    <Paper key={g._id} variant="outlined" sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>{g.game?.title || 'Game not found'}</Typography>
                      <Typography color="error.main">-{g.discount}%</Typography>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                {!sale.isActive && status.label !== 'Ended' && (
                  <Button
                    startIcon={<PlayCircleIcon />}
                    onClick={() => activateSale(sale._id)}
                    disabled={isActivatingSale}
                  >
                    Activate Now
                  </Button>
                )}
                {sale.isActive && (
                  <Button
                    startIcon={<PauseCircleIcon />}
                    onClick={() => deactivateSale(sale._id)}
                    color="warning"
                    disabled={isDeactivatingSale}
                  >
                    Deactivate Now
                  </Button>
                )}
              </CardActions>
            </Card>
          )
        }) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5">No sales found.</Typography>
            <Typography>Click "Create New Sale" to get started.</Typography>
          </Paper>
        )}
      </Stack>

      <CreateSaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        developerGames={developerGames}
      />
    </Container>
  );
}