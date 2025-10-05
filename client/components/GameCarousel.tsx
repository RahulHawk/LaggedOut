import { Box, Typography, keyframes, Button } from "@mui/material";
import ReactSlickSlider from "react-slick";
import Link from 'next/link';
import { Game } from "@/typescript/homeTypes";
import { GameCard } from "./GameCard";
import { SliderArrow } from "./SliderArrow";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface GameCarouselProps {
    title: string;
    games: Game[];
    showAllLink?: string;
}

export const GameCarousel = ({ title, games, showAllLink }: GameCarouselProps) => {
    // REMOVED: The line 'if (!games || games.length === 0) { return null; }' was here.
    // This now allows the title to always be visible.

    const desktopSlides = 5;

    const settings = {
        dots: false,
        // Use the length of games to determine if looping is possible
        infinite: games && games.length > desktopSlides,
        speed: 500,
        slidesToShow: desktopSlides,
        slidesToScroll: 2,
        nextArrow: <SliderArrow direction="right" />,
        prevArrow: <SliderArrow direction="left" />,
        responsive: [{ breakpoint: 1280, settings: { slidesToShow: 4 } }, { breakpoint: 900, settings: { slidesToShow: 3 } }, { breakpoint: 600, settings: { slidesToShow: 2 } }],
    };

    return (
        <Box component="section" mb={6} sx={{ animation: `${fadeIn} 0.7s ease-in-out` }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" sx={{ color: "#ffffff", fontWeight: 400 }}>{title}</Typography>
                {showAllLink && (
                    <Link href={showAllLink} passHref>
                        <Button variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: '#fff' } }}>
                            Show All
                        </Button>
                    </Link>
                )}
            </Box>

            {/* Conditionally render the slider OR an empty message */}
            {games && games.length > 0 ? (
                // Your perfect sizing logic is preserved here
                games.length >= desktopSlides ? (
                    <ReactSlickSlider {...settings}>
                        {games.map(game => (
                            <Box key={game._id} sx={{ p: 1, aspectRatio: '2.25 / 3', display: 'flex' }}>
                                <Link href={`/games/${game._id}`} passHref style={{ display: 'block', flex: 1 }}>
                                    <GameCard game={game} />
                                </Link>
                            </Box>
                        ))}
                    </ReactSlickSlider>
                ) : (
                    <Box display="flex" flexDirection="row" mx={-1}>
                        {games.map(game => (
                            <Box
                                key={game._id}
                                sx={{
                                    px: 1,
                                    width: `calc(100% / ${desktopSlides})`,
                                    flexShrink: 0,
                                    aspectRatio: '2.25 / 3',
                                }}
                            >
                                <Link href={`/games/${game._id}`} passHref style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                                    <GameCard game={game} />
                                </Link>
                            </Box>
                        ))}
                    </Box>
                )
            ) : (
                <Box sx={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                    <Typography>No games to show in this category yet.</Typography>
                </Box>
            )}
        </Box>
    );
};