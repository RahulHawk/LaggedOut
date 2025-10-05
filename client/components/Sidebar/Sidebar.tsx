import { Box, Typography, List, ListItemButton, ListItemText } from "@mui/material";
import Link from "next/link";
import { usePathname } from 'next/navigation'; // ADDED: Import usePathname

interface SidebarProps {
  categories: { key: string; label: string }[];
  // REMOVED: selectedCategory and setSelectedCategory props are no longer needed
}

// UPDATED: Added a link for the homepage ('recentlyAdded')
const categoryLinks: { [key: string]: string } = {
    recentlyAdded: '/games/recently-added',
    recentlyUpdated: '/games/recently-updated',
    byGenre: '/genres',
    byDeveloper: '/developers',
};

export const Sidebar: React.FC<SidebarProps> = ({ categories }) => {
  const pathname = usePathname(); // ADDED: Get the current page's path

  return (
    <Box
      component="aside"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 240,
        height: '100vh',
        borderRight: '1px solid #2a3a4b',
        bgcolor: '#1b2838',
        zIndex: 1100,
      }}
    >
      <Box p={2} mt={8}>
        <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: 600 }}>
          Browse
        </Typography>
      </Box>
      <List>
        {categories.map(cat => {
          const linkHref = categoryLinks[cat.key];
          // Determine if the current item is selected by comparing its link to the current path
          const isSelected = pathname === linkHref;

          if (linkHref) {
            return (
              <Link href={linkHref} passHref key={cat.key} style={{ textDecoration: 'none', color: 'inherit' }}>
                <ListItemButton
                  selected={isSelected} // UPDATED
                  sx={{
                    borderRadius: 1, mb: 0.5, mx: 1,
                    borderLeft: 4, borderColor: isSelected ? "#66c0f4" : "transparent",
                    bgcolor: isSelected ? "rgba(102, 192, 244, 0.1)" : "transparent",
                    '&:hover': { bgcolor: "rgba(102, 192, 244, 0.2)" }
                  }}
                >
                  <ListItemText primary={cat.label} primaryTypographyProps={{ sx: { color: "#ffffff" } }} />
                </ListItemButton>
              </Link>
            );
          }
          // Fallback for items that aren't links (optional)
          return null;
        })}
      </List>
    </Box>
  );
};