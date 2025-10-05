import { Box, Typography, Avatar, Paper } from '@mui/material';
// 1. Import the type for the full profile data
import type { MyProfileData } from '@/typescript/profileTypes';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

// 2. Define the props for this component
interface ProfileHeaderProps {
  user: MyProfileData;
  onAvatarClick: () => void;
}

export const ProfileHeader = ({ user, onAvatarClick }: ProfileHeaderProps) => (
  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff' }}>
    <Box onClick={onAvatarClick} sx={{ position: 'relative', cursor: 'pointer', '&:hover .overlay': { opacity: 1 } }}>
        <Avatar src={user.profile.displayAvatar} sx={{ width: 90, height: 90, border: '2px solid #66c0f4' }} />
        <Box 
            className="overlay"
            sx={{ 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                bgcolor: 'rgba(0,0,0,0.5)', borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', opacity: 0,
                transition: 'opacity 0.2s ease-in-out'
            }}
        >
            <PhotoCameraIcon />
        </Box>
    </Box>
    <Box ml={3}>
      <Typography variant="h4" fontWeight={700}>{user.displayName}</Typography>
      <Box display="flex" gap={3} mt={1}>
        <Typography><strong>{user.stats?.gamesOwned ?? 0}</strong> Games</Typography>
        <Typography><strong>{user.stats?.achievementsUnlocked ?? 0}</strong> Achievements</Typography>
        <Typography><strong>{user.stats?.friendsCount ?? 0}</strong> Friends</Typography>
      </Box>
    </Box>
  </Paper>
);