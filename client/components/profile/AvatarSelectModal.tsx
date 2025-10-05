import React, { useState } from 'react';
import { Modal, Box, Typography, Tabs, Tab, Button, CircularProgress, Avatar } from '@mui/material';
import { useUpdateProfileMutation } from '@/customHooks/profile.hooks.query';
import type { Avatar as AvatarType } from '@/typescript/achievementTypes'; // Use an alias to prevent name conflicts

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', md: 600 },
  bgcolor: '#1f2a38',
  border: '2px solid #66c0f4',
  boxShadow: 24,
  p: 4,
  color: '#fff',
};

interface AvatarSelectModalProps {
    open: boolean;
    handleClose: () => void;
    avatars: AvatarType[];
}

export const AvatarSelectModal = ({ open, handleClose, avatars }: AvatarSelectModalProps) => {
    const [tabIndex, setTabIndex] = useState(0);
    const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);

    const updateProfileMutation = useUpdateProfileMutation();

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => setTabIndex(newValue);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // The updateProfile mutation is smart enough to handle FormData
            const formData = new FormData();
            formData.append('profilePic', file);
            updateProfileMutation.mutate(formData, { onSuccess: handleClose });
        }
    };
    
    const handleAvatarSelect = () => {
        if (!selectedAvatarId) return;
        updateProfileMutation.mutate({ selectedAvatar: selectedAvatarId }, { onSuccess: handleClose });
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <Typography variant="h5" mb={2}>Change Your Avatar</Typography>
                <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 3 }}>
                    <Tab label="Select Avatar" />
                    <Tab label="Upload Picture" />
                </Tabs>

                {tabIndex === 0 && (
                    <Box>
                        <Typography variant="body2" color="text.secondary" mb={2}>Select from your collected avatars.</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, maxHeight: '40vh', overflowY: 'auto' }}>
                            {avatars.length > 0 ? avatars.map(avatar => (
                                <Avatar 
                                    key={avatar._id} 
                                    src={avatar.imageUrl} 
                                    onClick={() => setSelectedAvatarId(avatar._id)}
                                    sx={{ 
                                        width: 80, height: 80, cursor: 'pointer',
                                        border: selectedAvatarId === avatar._id ? '3px solid #66c0f4' : '3px solid transparent'
                                    }}
                                />
                            )) : <Typography>Your avatar inventory is empty.</Typography>}
                        </Box>
                         <Button variant="contained" onClick={handleAvatarSelect} disabled={!selectedAvatarId || updateProfileMutation.isPending} sx={{ mt: 3 }}>
                            {updateProfileMutation.isPending ? <CircularProgress size={24} /> : 'Set as Avatar'}
                        </Button>
                    </Box>
                )}

                {tabIndex === 1 && (
                    <Box>
                        <Typography variant="body2" color="text.secondary" mb={2}>Upload a custom profile picture (max 2MB).</Typography>
                        <Button variant="contained" component="label" disabled={updateProfileMutation.isPending}>
                            {updateProfileMutation.isPending ? <CircularProgress size={24} /> : 'Choose File'}
                            <input type="file" hidden accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} />
                        </Button>
                    </Box>
                )}
            </Box>
        </Modal>
    );
};