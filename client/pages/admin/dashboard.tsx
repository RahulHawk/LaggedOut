'use client';

import React, { useState } from 'react';
// FIX: No longer need useGetDevLinkRequests here as the child component handles it
import { useGetAdminProfile, useGetOverallAnalytics } from '@/customHooks/admin.hooks.query'; 

import { Container, Typography, Box, Tabs, Tab, CircularProgress } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreditScoreIcon from '@mui/icons-material/CreditScore';

// Import the components for each tab
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { UserManagement } from '@/components/admin/UserManagement';
import { DevRequests } from '@/components/admin/DevRequests';
import { ContentManagement } from '@/components/admin/ContentManagement';
import { GameManagement } from '@/components/admin/GameManagement';
import { RefundManagement } from '@/components/admin/RefundManagement';
import Head from 'next/head';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [tabValue, setTabValue] = useState(0);

  // Fetch only the data needed for the main dashboard and its direct children
  const { data: profileData, isLoading: isProfileLoading } = useGetAdminProfile();
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useGetOverallAnalytics();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // FIX: Simplified the combined loading state
  const isLoading = isProfileLoading || isAnalyticsLoading;

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  return (
    <>
    <Head><title>Admin Dashboard | LaggedOut</title></Head>

    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h1" gutterBottom>Admin Dashboard</Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          <Tab icon={<DashboardIcon />} iconPosition="start" label="Overview" />
          <Tab icon={<PeopleIcon />} iconPosition="start" label="User Management" />
          <Tab icon={<RequestQuoteIcon />} iconPosition="start" label="Developer Requests" />
          <Tab icon={<ContentPasteIcon />} iconPosition="start" label="Content Management" />
          <Tab icon={<CheckCircleIcon />} iconPosition="start" label="Game Approvals" />
          <Tab icon={<CreditScoreIcon />} iconPosition="start" label="Refund Management" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <DashboardOverview profileData={profileData} analyticsData={analyticsData} />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <UserManagement profileData={profileData} />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        {/* FIX: No longer need to pass the devRequests prop */}
        <DevRequests />
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        <ContentManagement />
      </TabPanel>
      <TabPanel value={tabValue} index={4}>
        <GameManagement />
      </TabPanel>
      <TabPanel value={tabValue} index={5}>
          <RefundManagement />
        </TabPanel>
    </Container>
    </>
  );
}