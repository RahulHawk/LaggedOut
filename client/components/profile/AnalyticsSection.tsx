import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDeveloperAnalyticsQuery } from '@/customHooks/profile.hooks.query';

export const AnalyticsSection = () => {
    const { data: analytics, isLoading } = useDeveloperAnalyticsQuery();

    if (isLoading) return <CircularProgress />;
    if (!analytics) return <Typography>Could not load analytics.</Typography>;

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 4, bgcolor: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
                <Typography color="text.secondary">Total Revenue</Typography>
                <Typography variant="h3" fontWeight={700} sx={{ color: '#4caf50' }}>
                    ₹{analytics.totalRevenue.toFixed(2)}
                </Typography>
            </Paper>

            <Typography variant="h5" fontWeight={600} gutterBottom>Revenue by Game</Typography>

            <Paper sx={{ p: 3, mb: 4, bgcolor: 'rgba(0,0,0,0.2)' }}>
                <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.revenueByGame}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey="gameTitle" stroke="#ccc" />
                            <YAxis stroke="#ccc" />
                            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                            <Legend />
                            <Bar dataKey="totalRevenue" fill="#8884d8" name="Revenue (₹)" />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Paper>

            <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Game Title</TableCell>
                            <TableCell align="right">Sales Count</TableCell>
                            <TableCell align="right">Total Revenue (₹)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {analytics.revenueByGame.map((row) => (
                            <TableRow key={row.gameId}>
                                <TableCell component="th" scope="row">{row.gameTitle}</TableCell>
                                <TableCell align="right">{row.salesCount}</TableCell>
                                <TableCell align="right">{row.totalRevenue.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};