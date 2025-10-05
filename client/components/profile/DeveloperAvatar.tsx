import React, { useRef } from 'react';
import { Box, Avatar, CircularProgress, IconButton } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
// Import the existing mutation hook for updating the profile
import { useUpdateProfileMutation } from '@/customHooks/profile.hooks.query';

interface DeveloperAvatarProps {
    src: string;
}

export const DeveloperAvatar = ({ src }: DeveloperAvatarProps) => {
    // This mutation is the same one used by players to update their profile
    const { mutate: updateProfile, isPending } = useUpdateProfileMutation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // The mutation hook already knows how to handle FormData for file uploads
            updateProfile({ profilePic: file });
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Box
            onClick={handleAvatarClick}
            sx={{
                position: 'relative',
                cursor: 'pointer',
                '&:hover .overlay': { opacity: 1 },
                width: 120,
                height: 120
            }}
        >
            <Avatar src={src} sx={{ width: '100%', height: '100%', border: '4px solid #66c0f4' }} />
            
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg"
                style={{ display: 'none' }}
                disabled={isPending}
            />

            {/* Hover Overlay */}
            <Box
                className="overlay"
                sx={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    bgcolor: 'rgba(0,0,0,0.5)', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: isPending ? 1 : 0, // Show overlay during loading
                    transition: 'opacity 0.2s ease-in-out'
                }}
            >
                {isPending ? <CircularProgress size={24} color="inherit" /> : <PhotoCameraIcon />}
            </Box>
        </Box>
    );
};