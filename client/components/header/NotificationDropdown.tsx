import React, { useState } from 'react';
import { Menu, MenuItem, Typography, Box, Divider, Button, Avatar, CircularProgress } from '@mui/material';
import NextLink from 'next/link';
import { useNotificationsQuery, useMarkAsReadMutation } from '@/customHooks/notification.hooks.query';
import { Notification } from '@/typescript/notificationTypes';

const UnreadDot = () => (
    <Box sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        bgcolor: 'primary.main',
        ml: 'auto'
    }} />
);

interface NotificationDropdownProps {
    anchorEl: null | HTMLElement;
    open: boolean;
    onClose: () => void;
}

export const NotificationDropdown = ({ anchorEl, open, onClose }: NotificationDropdownProps) => {
    const { data: notifications, isLoading } = useNotificationsQuery();
    const { mutate: markAsRead } = useMarkAsReadMutation();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleItemClick = (notification: Notification) => {
        if (!notification.read) {
            markAsRead(notification._id);
        }
        setExpandedId(expandedId === notification._id ? null : notification._id);
    };
    
    const recentNotifications = notifications?.slice(0, 5) || [];

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            // ✅ FIX: This prevents the page from shifting
            disableScrollLock={true}
            PaperProps={{
                sx: {
                    // ✅ TWEAK: Made slightly smaller as requested
                    width: '360px', 
                    bgcolor: '#2a475e',
                    color: '#c7d5e0',
                    mt: 1.5,
                },
            }}
        >
            <Typography variant="h6" sx={{ px: 2, py: 1 }}>Notifications</Typography>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            
            {isLoading && <MenuItem><CircularProgress size={20} /></MenuItem>}
            
            {!isLoading && recentNotifications.length === 0 && (
                <MenuItem>
                    <Typography>You have no new notifications.</Typography>
                </MenuItem>
            )}

            {recentNotifications.map((notification) => (
                <MenuItem
                    key={notification._id}
                    onClick={() => handleItemClick(notification)}
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        py: 1.5,
                        flexWrap: 'wrap',
                        bgcolor: !notification.read ? 'rgba(102, 192, 244, 0.1)' : 'transparent',
                    }}
                >
                    <Avatar src={notification.relatedUser?.profile.profilePic} />
                    <Box>
                        <Typography variant="body2" sx={{ whiteSpace: 'normal', color: '#fff' }}>
                            {notification.content}
                        </Typography>
                        {expandedId === notification._id && (
                             <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                                {new Date(notification.createdAt).toLocaleString()}
                            </Typography>
                        )}
                    </Box>
                    {!notification.read && <UnreadDot />}
                </MenuItem>
            ))}

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <Box sx={{ p: 1, textAlign: 'center' }}>
                <NextLink href="/notifications" passHref>
                    <Button fullWidth onClick={onClose}>View All Notifications</Button>
                </NextLink>
            </Box>
        </Menu>
    );
};