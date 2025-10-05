import { Box, Typography, keyframes } from "@mui/material";
import { GameRecommendation } from "@/typescript/homeTypes";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface GameRecommendationCarouselProps {
  title: string;
  games: GameRecommendation[];
}

export const GameRecommendationCarousel = ({ title, games }: GameRecommendationCarouselProps) => {
  if (!games || games.length === 0) return null;

  const desktopSlides = 4; // controls width of cards

  return (
    <Box mb={6} sx={{ animation: `${fadeIn} 0.7s ease-in-out` }}>
      <Typography variant="h5" sx={{ color: "#ffffff", fontWeight: 400, mb: 2 }}>
        {title}
      </Typography>

      <Box
        display="flex"
        flexWrap="wrap"
        gap={2}
        sx={{
          // ensures cards stay within the main scrollable area
          overflow: 'hidden',
        }}
      >
        {games.map((game) => {
          const screenshot = game.screenshots?.[0] || game.coverImage;

          return (
            <Box
              key={game._id}
              sx={{
                width: `calc(25% - 8px)`, // 4 slides with gap 2 spacing
                aspectRatio: "3.5 / 2",
                cursor: "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 4px 20px rgba(102,192,244,0.5)",
                },
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 2,
                  overflow: "hidden",
                  bgcolor: "rgba(255,255,255,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  position: "relative",
                }}
              >
                <img
                  src={screenshot}
                  alt={game.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                />
                <Box
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    bgcolor: "rgba(0,0,0,0.6)",
                    py: 0.5,
                    px: 1,
                    textAlign: "center",
                  }}
                >
                  <Typography sx={{ color: "#fff", fontSize: "0.85rem", fontWeight: 500 }}>
                    {game.title}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
