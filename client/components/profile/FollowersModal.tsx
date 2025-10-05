import React from 'react';
import { Modal, Box, Typography, List, ListItemButton, ListItemAvatar, Avatar, ListItemText, CircularProgress } from '@mui/material';
import NextLink from 'next/link';
import { useFollowersQuery } from '@/customHooks/developer.hooks.query';

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

interface FollowersModalProps {
    open: boolean;
    onClose: () => void;
    developerId: string;
}

export const FollowersModal = ({ open, onClose, developerId }: FollowersModalProps) => {
    const { data: followers, isLoading } = useFollowersQuery(developerId);

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6" component="h2">Followers</Typography>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    followers && followers.length > 0 ? (
                        <List>
                            {followers.map(follower => (
                                <NextLink
                                    key={follower.id}
                                    href={`/auth/profile/${follower.id}`}
                                    passHref
                                >
                                    <ListItemButton component="a">
                                        <ListItemAvatar>
                                            <Avatar src={follower.avatar} />
                                        </ListItemAvatar>
                                        <ListItemText primary={follower.firstName + ' ' + follower.lastName} />
                                    </ListItemButton>
                                </NextLink>
                            ))}
                        </List>
                    ) : (
                        <Typography sx={{ mt: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                            This developer has no followers yet.
                        </Typography>
                    )
                )}
            </Box>
        </Modal>
    );
};
