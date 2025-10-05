import { useState, useEffect } from 'react';
import { Modal, Box, Typography, Tabs, Tab, TextField, Button, CircularProgress, Badge } from '@mui/material';
import { useUpdateProfileMutation, useUpdateEmailMutation, useUpdatePasswordMutation } from '@/customHooks/profile.hooks.query';
import type { MyProfileData } from '@/typescript/profileTypes';

interface SettingsModalProps {
    open: boolean;
    handleClose: () => void;
    profile: MyProfileData;
}

export const SettingsModal = ({ open, handleClose, profile }: SettingsModalProps) => {
    const [tabIndex, setTabIndex] = useState(0);

    const [profileDetails, setProfileDetails] = useState({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.profile.bio || '',
    });

    // FIX: Initialize with userName from profile
    const [username, setUsername] = useState(profile.userName || '');
    const [email, setEmail] = useState('');
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });

    const updateProfileMutation = useUpdateProfileMutation();
    const updateEmailMutation = useUpdateEmailMutation();
    const updatePasswordMutation = useUpdatePasswordMutation();

    // Re-initialize state when the modal opens or profile data changes
    useEffect(() => {
        if (open) {
            setProfileDetails({ firstName: profile.firstName || '', lastName: profile.lastName || '', bio: profile.profile.bio || '' });
            setUsername(profile.userName || '');
        }
    }, [open, profile]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => setTabIndex(newValue);

    const handleProfileDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileDetails({ ...profileDetails, [e.target.name]: e.target.value });
    };

    const handleProfileSave = () => {
        updateProfileMutation.mutate(profileDetails, { onSuccess: handleClose });
    };

    const handleUsernameSave = () => {
        // FIX: The backend model and controller expect `userName` (camelCase)
        updateProfileMutation.mutate({ userName: username }, { onSuccess: handleClose });
    };

    const handleEmailSave = () => {
        updateEmailMutation.mutate({ newEmail: email }, { onSuccess: handleClose });
    };

    const handlePasswordSave = () => {
        updatePasswordMutation.mutate(passwords, { onSuccess: handleClose });
    };

    const isGoogleLinked = profile.authProviders?.some(p => p.provider === 'google');

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{
                position: 'absolute' as 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: { xs: '90%', md: 600 }, bgcolor: '#1f2a38', border: '2px solid #66c0f4',
                boxShadow: 24, p: 4, color: '#fff',
            }}>
                <Typography variant="h5" mb={2}>Account Settings</Typography>
                <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 3 }}>
                    <Tab label="Profile" />
                    <Tab label={<Badge color="error" variant="dot" invisible={profile.isUsernameSet}>Account</Badge>} />
                    <Tab label="Security" />
                </Tabs>

                {tabIndex === 0 && (
                     <Box>
                        <TextField fullWidth name="firstName" label="First Name" value={profileDetails.firstName} onChange={handleProfileDetailsChange} sx={{ mb: 2 }} />
                        <TextField fullWidth name="lastName" label="Last Name" value={profileDetails.lastName} onChange={handleProfileDetailsChange} sx={{ mb: 2 }} />
                        <TextField fullWidth multiline rows={4} name="bio" label="Bio" value={profileDetails.bio} onChange={handleProfileDetailsChange} sx={{ mb: 2 }} />
                        <Button variant="contained" onClick={handleProfileSave} disabled={updateProfileMutation.isPending}>
                            {updateProfileMutation.isPending ? <CircularProgress size={24} /> : 'Save Profile'}
                        </Button>
                    </Box>
                )}

                {tabIndex === 1 && (
                    <Box>
                        <Typography variant="h6">Username</Typography>
                        <Box display="flex" alignItems="center" gap={2} my={1}>
                            <TextField fullWidth label="Username" value={username} onChange={e => setUsername(e.target.value)} />
                            <Button variant="contained" onClick={handleUsernameSave} disabled={updateProfileMutation.isPending} sx={{ flexShrink: 0 }}>
                                {profile.isUsernameSet ? 'Update' : 'Set'} Username
                            </Button>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Your username is public and can be updated here.
                        </Typography>
                        <hr style={{ margin: '20px 0' }} />

                        {/* Email & Social */}
                        <Typography variant="h6">Email Address</Typography>
                        <TextField fullWidth label="New Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} sx={{ my: 1 }} />
                        <Button variant="contained" onClick={handleEmailSave} disabled={updateEmailMutation.isPending}>Update Email</Button>
                        <hr style={{ margin: '20px 0' }} />

                        <Typography variant="h6">Social Links</Typography>
                        {isGoogleLinked ? (
                            <Button variant="contained" disabled sx={{ mt: 1 }}>Google Account Linked</Button>
                        ) : (
                            <Button variant="contained" color="secondary" component="a" href={`${process.env.NEXT_PUBLIC_API_URL}/profile/link/google`} sx={{ mt: 1 }}>
                                Link Google Account
                            </Button>
                        )}
                    </Box>
                )}

                {/* Security Tab */}
                {tabIndex === 2 && (
                    <Box>
                        <TextField fullWidth label="Current Password" type="password" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} sx={{ mb: 2 }} />
                        <TextField fullWidth label="New Password" type="password" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} sx={{ mb: 2 }} />
                        <Button variant="contained" onClick={handlePasswordSave} disabled={updatePasswordMutation.isPending}>Update Password</Button>
                    </Box>
                )}
            </Box>
        </Modal>
    );
};
