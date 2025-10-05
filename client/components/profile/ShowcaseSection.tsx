import { Box, Typography, Paper } from '@mui/material';
import type { ShowcaseGame } from '@/typescript/profileTypes';

interface ShowcaseSectionProps {
  title?: string; // 👈 Changed title to be optional
  items: ShowcaseGame[];
}

export const ShowcaseSection = ({ title, items = [] }: ShowcaseSectionProps) => (
  <Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff', mt: 1 }}>
    {/* 👇 Conditionally render the title only if it's provided */}
    {title && (
        <Typography variant="h6" fontWeight={600} mb={2} sx={{ borderBottom: '1px solid #66c0f4', pb: 1 }}>
            {title}
        </Typography>
    )}
    
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {items.map(item => (
        <Box key={item._id} sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(20% - 13px)' } }}>
          <img src={item.coverImage} alt={item.title} style={{ width: '100%', borderRadius: '4px', display: 'block' }} />
        </Box>
      ))}
    </Box>
  </Paper>
);