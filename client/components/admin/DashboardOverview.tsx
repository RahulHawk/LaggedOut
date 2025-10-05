import React from 'react';
import { AdminProfileData, OverallAnalyticsData } from '@/typescript/adminTypes';
import { Paper, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Props {
  profileData?: AdminProfileData;
  analyticsData?: OverallAnalyticsData;
}

// A simple component for displaying a key statistic
const StatCard = ({ title, value }: { title: string, value: string | number }) => (
  <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
    <Typography variant="h6">{title}</Typography>
    <Typography variant="h3">{value}</Typography>
  </Paper>
);

export const DashboardOverview: React.FC<Props> = ({ profileData, analyticsData }) => {
  if (!profileData || !analyticsData) return null;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    // FIX: Replaced <Grid container> with a <Box> using Flexbox
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      
      {/* Stat Cards */}
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } }}>
        <StatCard title="Total Revenue" value={`$${analyticsData.purchases.totalRevenue.toFixed(2)}`} />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } }}>
        <StatCard title="Total Users" value={analyticsData.users.totalUsers} />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } }}>
        <StatCard title="Total Games" value={analyticsData.games.totalGames} />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } }}>
        <StatCard title="Active Sales" value={analyticsData.sales.totalActiveSales} />
      </Box>

      {/* Charts */}
      <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
        <Paper sx={{ p: 2, height: 300 }}>
          <Typography variant="h5" gutterBottom>Games per Genre</Typography>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={analyticsData.games.gamesPerGenre} dataKey="count" nameKey="genre" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                {analyticsData.games.gamesPerGenre.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
      <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
        <Paper sx={{ p: 2, height: 300 }}>
           <Typography variant="h5" gutterBottom>Sales by Genre</Typography>
          <ResponsiveContainer width="100%" height="90%">
              <BarChart data={profileData.salesByGenre}>
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
    </Box>
  );
};