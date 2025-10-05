import { Box, Typography, Paper, Avatar } from '@mui/material';
import type { Friend } from '@/typescript/profileTypes';

interface ProfileSidebarProps {
  bio?: string;
  friends?: Friend[]; // Make prop optional
}

// FIX: Provide a default value for the 'friends' prop.
// If it's undefined, it will default to an empty array [].
export const ProfileSidebar = ({ bio, friends = [] }: ProfileSidebarProps) => (
  <Box>
    <Paper sx={{ p: 2, mb: 3, backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff' }}>
      <Typography variant="h6" fontWeight={600} mb={1}>Bio</Typography>
      <Typography variant="body2" color="grey.400">{bio || 'No bio provided.'}</Typography>
    </Paper>
    <Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff' }}>
      {/* This line is now safe. If friends is undefined, it will show (0). */}
      <Typography variant="h6" fontWeight={600} mb={2}>Friends ({friends.length})</Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {friends.slice(0, 9).map(friend => (
          <Avatar key={friend.id} src={friend.avatar} sx={{ width: 56, height: 56 }} />
        ))}
      </Box>
    </Paper>
  </Box>
);