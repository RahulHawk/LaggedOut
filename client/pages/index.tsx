import { useState, useMemo, useEffect, useRef } from "react";
import { Box, Typography, CircularProgress, Button, keyframes, IconButton } from "@mui/material";
import { Sidebar } from "@/components/Sidebar/Sidebar"; // using the new sidebar component
import { HeroSlider } from "@/components/HeroSlider";
import { GameCarousel } from "@/components/GameCarousel";
import { GameRecommendationCarousel } from "@/components/GameRecommendationCarousel";
import { useGamesQuery, useRecommendationsQuery } from "@/customHooks/home.hooks.query";
import { useAuth } from "@/customHooks/auth.hooks.query";
import { Loading } from "@/components/common/Loading";
import Head from "next/head";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { GameRecommendation } from "@/typescript/homeTypes";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const IndexPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const { data: gamesData, isLoading: gamesLoading } = useGamesQuery({ page: 1, limit: 12 });
  const { data: recData, isLoading: recLoading } = useRecommendationsQuery();

  // --- START: LOGIC FOR HORIZONTAL CAROUSEL ---
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleScroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
          const scrollAmount = scrollRef.current.clientWidth; // Scroll by the visible width
          scrollRef.current.scrollBy({
              left: direction === 'left' ? -scrollAmount : scrollAmount,
              behavior: 'smooth'
          });
      }
  };
  // --- END: LOGIC FOR HORIZONTAL CAROUSEL ---

    useEffect(() => {
          const { status, prompt, error } = router.query;
  
          if (status === 'login_success') {
              toast.success("Login successful!");
              if (prompt === 'username') {
                  toast.info("Welcome! Please set your username for privacy reasons.");
              }
              router.replace('/', undefined, { shallow: true });
          } else if (error) {
              toast.error("Google authentication failed. Please try again.");
              router.replace('/auth/login', undefined, { shallow: true });
          }
      }, [router.query, router]);

  const specialOffers = useMemo(() => {
    if (!gamesData?.data) return [];
    return gamesData.data.filter(game => game.onSale);
  }, [gamesData]);

  const categories = useMemo(() => [
    { key: "recentlyAdded", label: "Recently Added" },
    { key: "recentlyUpdated", label: "Recently Updated" },
    { key: "byGenre", label: "By Genre" },
    { key: "byDeveloper", label: "By Developer" },
  ], []);

  const pageName = "Dashboard";

  if (gamesLoading) {
    return (
      <Loading />
    );
  }

  return (
    <><Head>
      <title>{`Store | ${pageName}`}</title>
      <meta name="description" content="Your one-stop shop for the latest and greatest games." />
    </Head>
      <Box sx={{ bgcolor: "#1b2838", color: "#c7dd5e0" }}>
        <Sidebar
                categories={categories}
            />
        <Box
          component="main"
          sx={{
            marginLeft: '240px', 
            p: 4,
          }}
        >
          {gamesData && <HeroSlider games={gamesData.data} />}
          {specialOffers.length > 0 && (
            <GameCarousel title="Special Offers" games={specialOffers} showAllLink="/sales" />
          )}

          {isLoggedIn ? (
            recLoading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : recData ? (
              <>
                {/* --- START: MODIFIED RECENTLY VIEWED SECTION --- */}
                {recData.data.recentlyViewed?.length > 0 && (
                  <Box mb={6} sx={{ animation: `${fadeIn} 0.7s ease-in-out`, position: 'relative' }}>
                    <Typography variant="h5" sx={{ color: "#ffffff", fontWeight: 400, mb: 2 }}>
                      Recently Viewed
                    </Typography>
                    <IconButton
                      onClick={() => handleScroll('left')}
                      sx={{ position: 'absolute', left: -20, top: '55%', transform: 'translateY(-50%)', zIndex: 2, bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                    >
                      <ArrowBackIosNewIcon />
                    </IconButton>
                    <Box
                      ref={scrollRef}
                      sx={{
                        display: 'flex',
                        gap: 2,
                        overflowX: 'auto',
                        '&::-webkit-scrollbar': { display: 'none' },
                        scrollbarWidth: 'none',
                        paddingBottom: '10px' // Add some padding if shadows get cut off
                      }}
                    >
                      {recData.data.recentlyViewed.map((game: GameRecommendation) => {
                        const screenshot = game.screenshots?.[0] || game.coverImage;
                        return (
                          // This is the JSX for a single card, taken from your GameRecommendationCarousel.tsx
                          <Box
                            key={game._id}
                            sx={{
                              width: `calc(25% - 12px)`, // 4 cards visible
                              flexShrink: 0, // Prevent items from shrinking
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
                                width: "100%", height: "100%", borderRadius: 2, overflow: "hidden",
                                display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative",
                              }}
                            >
                              <img
                                src={screenshot}
                                alt={game.title}
                                style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }}
                              />
                              <Box sx={{ position: "relative", zIndex: 1, bgcolor: "rgba(0,0,0,0.6)", py: 0.5, px: 1, textAlign: "center" }}>
                                <Typography sx={{ color: "#fff", fontSize: "0.85rem", fontWeight: 500 }}>
                                  {game.title}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                    <IconButton
                      onClick={() => handleScroll('right')}
                      sx={{ position: 'absolute', right: -20, top: '55%', transform: 'translateY(-50%)', zIndex: 2, bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                    >
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </Box>
                )}
                {/* --- END: MODIFIED RECENTLY VIEWED SECTION --- */}

                {recData.data.recommendedByFriends?.length > 0 && (
                  <GameRecommendationCarousel
                    title="Recommended by Friends"
                    games={recData.data.recommendedByFriends}
                  />
                )}
                {recData.data.recommendedBySimilarity?.length > 0 && (
                  <GameRecommendationCarousel
                    title="Recommended by Similarity"
                    games={recData.data.recommendedBySimilarity}
                  />
                )}
                {recData.data.recommendedByFollowing?.length > 0 && (
                  <GameRecommendationCarousel
                    title="Recommended by Following"
                    games={recData.data.recommendedByFollowing}
                  />
                )}
              </>
            ) : (
              <Typography sx={{ textAlign: 'center', my: 4, fontStyle: 'italic' }}>
                No recommendations available at this time.
              </Typography>
            )
          ) : (
            <Box
              textAlign="center"
              py={5}
              sx={{
                bgcolor: 'rgba(0,0,0,0.2)',
                borderRadius: 2,
                animation: `${fadeIn} 0.5s ease-in-out`
              }}
            >
              <Typography variant="h6" sx={{ color: '#fff' }}>
                Want personalized recommendations?
              </Typography>
              <Typography sx={{ color: '#c7d5e0', mb: 2 }}>
                Sign in to see recommendations based on your gaming history.
              </Typography>
              <Button
                variant="contained"
                sx={{ bgcolor: '#66c0f4', '&:hover': { bgcolor: '#77d1f5' } }}
                href="/auth/login"
              >
                Sign In
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default IndexPage;