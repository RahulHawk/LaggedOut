import { Box, Typography, Paper, Avatar, Tooltip, Button } from '@mui/material';
import { useRouter } from 'next/router';
// Use the unified Badge type
import type { Badge } from '@/typescript/profileTypes';

interface BadgesShowcaseProps {
  badges: Badge[];
}

export const BadgesShowcase = ({ badges }: BadgesShowcaseProps) => {
  const router = useRouter();
  const badgesToShow = badges.slice(0, 5); // Show a maximum of 5 badges

  return (
    <Paper sx={{ p: 2, mt: 3, backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>Badges ({badges.length})</Typography>
        {badges.length > 5 && (
            <Button size="small" onClick={() => router.push('/achievements')}>Show All</Button>
        )}
      </Box>

      {badgesToShow.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {badgesToShow.map((badge) => (
            <Tooltip key={badge._id} title={badge.name}>
              <Avatar 
                src={badge.image} // Now it can correctly access the 'image' property
                sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.1)' }} 
              />
            </Tooltip>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="grey.500" fontStyle="italic">
          No badges earned yet.
        </Typography>
      )}
    </Paper>
  );
};