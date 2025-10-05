import { Box, Typography, Button, Chip, keyframes } from "@mui/material";
import ReactSlickSlider from "react-slick";
import type Slider from "react-slick";
import Link from 'next/link';
import Image from 'next/image';
import { Game } from "@/typescript/homeTypes";
import { useState, useEffect, useRef } from "react";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface HeroSliderProps {
    games: Game[];
}

export const HeroSlider = ({ games }: HeroSliderProps) => {
    const [nav1, setNav1] = useState<Slider | null>(null);
    const [nav2, setNav2] = useState<Slider | null>(null);
    const slider1 = useRef<Slider>(null);
    const slider2 = useRef<Slider>(null);

    useEffect(() => {
        if (slider1.current && slider2.current) {
            setNav1(slider1.current);
            setNav2(slider2.current);
        }
    }, [games]);

    return (
        <Box component="section" mb={6} sx={{ animation: `${fadeIn} 0.5s ease-in-out` }}>
            <Typography variant="h4" mb={2} sx={{ color: "#ffffff", fontWeight: 600 }}>Featured & Recommended</Typography>

            <ReactSlickSlider
                asNavFor={nav2}
                ref={slider1}
                arrows={false}
                autoplay={true}
                autoplaySpeed={4000}
                pauseOnHover={true}
            >
                {games.map(game => (
                    // THE FIX: Changed maxHeight to height to give the container a defined size
                    <Box key={game._id} sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', height: '70vh', width: '100%' }}>
                        <Image
                            src={game.screenshots?.[0] || game.coverImage}
                            alt={game.title}
                            fill
                            priority
                            sizes="100vw"
                            style={{ objectFit: 'cover', display: 'block', filter: 'brightness(0.6)' }}
                        />
                        <Box sx={{ position: 'absolute', zIndex: 1, bottom: 0, left: 0, p: 4, width: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                            <Typography variant="h3">{game.title}</Typography>
                            <Box my={1}>
                                {game.tags?.slice(0, 3).map(tag => (
                                    <Chip key={tag._id} label={tag.name} size="small" sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }} />
                                ))}
                            </Box>
                            <Link href={`/games/${game._id}`} passHref>
                                <Button variant="contained" sx={{ mt: 2, bgcolor: '#66c0f4' }}>View Details</Button>
                            </Link>
                        </Box>
                    </Box>
                ))}
            </ReactSlickSlider>

            <ReactSlickSlider
                asNavFor={nav1}
                ref={slider2}
                slidesToShow={5}
                swipeToSlide={true}
                focusOnSelect={true}
                centerMode={true}
                infinite={true}
                arrows={false}
                responsive={[{ breakpoint: 1024, settings: { slidesToShow: 3 } }, { breakpoint: 600, settings: { slidesToShow: 2 } }]}
                sx={{ mt: 2 }}
            >
                {games.map(game => (
                    <Box key={game._id} sx={{ p: 1, cursor: 'pointer' }}>
                        <Box sx={{ position: 'relative', width: '100%', aspectRatio: '2.25 / 3', borderRadius: 1, overflow: 'hidden', '&:hover img': { transform: 'scale(1.05)', filter: 'brightness(1.2)' } }}>
                            <Image
                                src={game.coverImage}
                                alt={`${game.title} thumbnail`}
                                fill
                                sizes="(max-width: 600px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                style={{ objectFit: 'cover', transition: '0.3s' }}
                            />
                        </Box>
                    </Box>
                ))}
            </ReactSlickSlider>
        </Box>
    );
};