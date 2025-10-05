import React from 'react';
import Head from 'next/head';
import {
    Container, Box, Typography, CircularProgress, Alert, Paper, Button, IconButton, Avatar, Divider, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

import { 
    useNotificationsQuery,
    useMarkAllAsReadMutation,
    useDeleteAllNotificationsMutation,
    useDeleteNotificationMutation,
    useMarkAsReadMutation
} from '@/customHooks/notification.hooks.query';

const NotificationsPage = () => {
    const { data: notifications, isLoading, isError, error } = useNotificationsQuery();
    const { mutate: markAllAsRead } = useMarkAllAsReadMutation();
    const { mutate: deleteAll } = useDeleteAllNotificationsMutation();
    const { mutate: deleteOne } = useDeleteNotificationMutation();
    const { mutate: markAsRead } = useMarkAsReadMutation();

    const handleMarkAll = () => {
        markAllAsRead();
    };

    const handleDeleteAll = () => {
        if (window.confirm("Are you sure you want to delete all your notifications? This cannot be undone.")) {
            deleteAll();
        }
    };

    const renderContent = () => {
        if (isLoading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
        if (isError) return <Alert severity="error">{(error as any)?.message || "Failed to load notifications."}</Alert>;
        if (!notifications || notifications.length === 0) {
            return <Alert severity="info">You have no notifications.</Alert>;
        }

        return (
            <Paper sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
                {notifications.map((notification, index) => (
                    <React.Fragment key={notification._id}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 2,
                                bgcolor: !notification.read ? 'rgba(102, 192, 244, 0.05)' : 'transparent',
                                cursor: !notification.read ? 'pointer' : 'default'
                            }}
                            onClick={() => {
                                if (!notification.read) {
                                    markAsRead(notification._id);
                                }
                            }}
                        >
                            <Avatar src={notification.relatedUser?.profile.profilePic} sx={{ width: 56, height: 56 }} />
                            <Box flexGrow={1}>
                                <Typography sx={{ color: '#fff' }}>{notification.content}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </Typography>
                            </Box>
                            <Tooltip title="Delete Notification">
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation(); // prevent marking as read
                                        deleteOne(notification._id);
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        {index < notifications.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />}
                    </React.Fragment>
                ))}
            </Paper>
        );
    };

    return (
        <>
            <Head><title>Notifications | LaggedOut</title></Head>
            <Box sx={{ p: 4, bgcolor: '#1b2838', minHeight: 'calc(100vh - 64px)', color: '#c7d5e0' }}>
                <Container maxWidth="md">
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h3" component="h1">Notifications</Typography>
                        <Box display="flex" gap={1}>
                            <Button onClick={handleMarkAll} startIcon={<MarkEmailReadIcon />}>Mark All as Read</Button>
                            <Button onClick={handleDeleteAll} color="error">Delete All</Button>
                        </Box>
                    </Box>
                    <Divider sx={{ mb: 4, bgcolor: '#0f1821' }} />
                    {renderContent()}
                </Container>
            </Box>
        </>
    );
};

export default NotificationsPage;
