import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation'; // Import useRouter
import {
    Container, Box, Typography, TextField, InputAdornment, Paper, List, ListItem, ListItemText,
    ListItemAvatar, Avatar, CircularProgress, Button, Tabs, Tab, Tooltip, IconButton
} from '@mui/material';
// ... other imports remain the same
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import { useDebounce } from '@/customHooks/useDebounce';
import { useAllFriendDataQuery, useFriendSearchQuery, useFriendMutations } from '@/customHooks/friend.hook.query';
import { FriendUser } from '@/typescript/friendTypes';

// A reusable component for a single user row in a list
const UserListItem = ({ user, actions, onClick }: { user: FriendUser; actions: React.ReactNode, onClick: () => void }) => (
    <ListItem
        onClick={onClick} // Add onClick handler to the entire item
        secondaryAction={actions}
        sx={{
            bgcolor: 'rgba(0,0,0,0.2)',
            borderRadius: 2,
            mb: 1,
            cursor: 'pointer', // Add cursor pointer to indicate it's clickable
            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
        }}
    >
        <ListItemAvatar>
            <Avatar src={user.profile.profilePic} />
        </ListItemAvatar>
        <ListItemText
            primary={`${user.firstName} ${user.lastName}`}
            secondary={`ID: ${user.userId || 'N/A'}`}
        />
    </ListItem>
);


const FriendsPage = () => {
    const [tab, setTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const router = useRouter(); // Initialize the router

    // --- DATA FETCHING & MUTATIONS ---
    const { data: allFriendData, isLoading: isLoadingFriendData } = useAllFriendDataQuery();
    const { data: searchResults, isLoading: isSearching } = useFriendSearchQuery(debouncedSearchQuery);
    const { sendRequest, cancelRequest, acceptRequest, rejectRequest, unfriend, blockUser } = useFriendMutations();

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    // Function to handle navigation
    const viewProfile = (userId: string) => {
        router.push(`/auth/profile/${userId}`);
    };

    const renderTabContent = () => {
        if (isLoadingFriendData) {
            return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
        }
        if (!allFriendData) {
            return <Typography>Could not load friend data.</Typography>;
        }

        switch (tab) {
            case 0: // My Friends
                return (
                    <List>
                        {allFriendData.friends.map(friend => (
                            <UserListItem
                                key={friend._id}
                                user={friend}
                                onClick={() => viewProfile(friend._id)} // Add click handler here
                                actions={
                                    <Box onClick={(e) => e.stopPropagation()}> {/* Stop propagation so clicking buttons doesn't trigger navigation */}
                                        <Tooltip title="Chat"><IconButton><ChatIcon /></IconButton></Tooltip>
                                        <Tooltip title="Unfriend"><IconButton onClick={() => unfriend({ friendId: friend._id })}><PersonRemoveIcon /></IconButton></Tooltip>
                                        <Tooltip title="Block"><IconButton onClick={() => blockUser({ blockUserId: friend._id })}><BlockIcon color="error" /></IconButton></Tooltip>
                                    </Box>
                                }
                            />
                        ))}
                    </List>
                );
            // ... rest of the cases
            case 1: // Friend Requests
                return (
                    <List>
                        {allFriendData.receivedRequests.map(request => (
                            <UserListItem
                                key={request._id}
                                user={request}
                                onClick={() => viewProfile(request._id)} // Add click handler here
                                actions={
                                    <Box onClick={(e) => e.stopPropagation()}>
                                        <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => acceptRequest({ requesterId: request._id })}>Accept</Button>
                                        <Button variant="outlined" color="error" startIcon={<CancelIcon />} sx={{ ml: 1 }} onClick={() => rejectRequest({ requesterId: request._id })}>Reject</Button>
                                    </Box>
                                } />
                        ))}
                    </List>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Head><title>Friends | LaggedOut</title></Head>
            <Box sx={{ p: 4, bgcolor: '#1b2838', minHeight: 'calc(100vh - 64px)', color: '#c7d5e0' }}>
                <Container maxWidth="md">
                    <Typography variant="h3" component="h1" gutterBottom>Manage Friends</Typography>

                    <Paper sx={{ p: 2, mb: 4, bgcolor: '#2a475e' }}>
                        {/* ... search textfield ... */}
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search for players by name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
                            }}
                        />
                        {isSearching && <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}><CircularProgress size={24} /></Box>}
                        {searchResults && debouncedSearchQuery && (
                            <List sx={{ mt: 2 }}>
                                {searchResults.map(user => {
                                    const isFriend = allFriendData?.friends.some(f => f._id === user._id);
                                    const requestSent = allFriendData?.sentRequests?.some(r => r._id === user._id);

                                    return (
                                        <UserListItem
                                            key={user._id}
                                            user={user}
                                            onClick={() => viewProfile(user._id)}
                                            actions={
                                                <Box onClick={(e) => e.stopPropagation()}>
    {isFriend ? (
        <Button variant="contained" color="success" startIcon={<CheckCircleIcon />}>
            Friends
        </Button>
    ) : requestSent ? (
        <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" disabled startIcon={<CancelIcon />}>
                Request Sent
            </Button>
            <Button 
                variant="contained" 
                color="error" 
                startIcon={<CancelIcon />} 
                onClick={() => cancelRequest({ receiverId: user._id })} 
            >
                Cancel Request
            </Button>
        </Box>
    ) : (
        <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => sendRequest({ receiverId: user._id })}
        >
            Add Friend
        </Button>
    )}
</Box>

                                            }
                                        />
                                    );
                                })}
                            </List>
                        )}
                    </Paper>

                    {/* --- TABS SECTION --- */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tab} onChange={handleTabChange} aria-label="friends tabs">
                            <Tab label={`My Friends (${allFriendData?.friends.length || 0})`} />
                            <Tab label={`Friend Requests (${allFriendData?.receivedRequests.length || 0})`} />
                        </Tabs>
                    </Box>
                    <Box sx={{ pt: 3 }}>
                        {renderTabContent()}
                    </Box>
                </Container>
            </Box>
        </>
    );
};

export default FriendsPage;