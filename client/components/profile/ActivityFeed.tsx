import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import type { Activity } from '@/typescript/profileTypes';

interface ActivityFeedProps {
  activities?: Activity[]; // Make prop optional
}

export const ActivityFeed = ({ activities = [] }: ActivityFeedProps) => (
  <Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff' }}>
    <Typography variant="h6" fontWeight={600} mb={1}>Recent Activity</Typography>
    <List>
      {activities.map(activity => {
        const primaryText = activity.game
          ? `Played ${activity.game.title}`
          : `Activity recorded (Game data not available)`;
        return (
          <ListItem key={activity._id} dense>
            <ListItemText 
              primary={primaryText} 
              secondary={formatDistanceToNow(new Date(activity.createdAt)) + ' ago'}
            />
          </ListItem>
        );
      })}
    </List>
  </Paper>
);