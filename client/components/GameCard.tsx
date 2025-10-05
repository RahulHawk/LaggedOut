import { Card, CardContent, Typography, Box, Chip, keyframes } from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import { Game } from "@/typescript/homeTypes"; // Ensure Game type includes createdAt and updatedAt
import Image from 'next/image';

const glassBlur = keyframes`
  from { backdrop-filter: blur(0px); background-color: rgba(15, 25, 34, 0.4); }
  to { backdrop-filter: blur(8px); background-color: rgba(15, 25, 34, 0.7); }
`;

interface GameCardProps {
    game: Game;
    displayDate?: 'added' | 'updated'; // ADDED: New optional prop
}

// ADDED: A helper function to format the date string nicely
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const GameCard = ({ game, displayDate }: GameCardProps) => {
    const hasFullDetails = 'basePrice' in game;
    const isOnSale = hasFullDetails && game.onSale && 'salePrice' in game;
    const hasRating = hasFullDetails && game.averageRating > 0;
    const hasTags = hasFullDetails && game.tags && game.tags.length > 0;
    const hasDeveloper = hasFullDetails && game.developer;

    // ADDED: Determine which date to show based on the prop
    const dateToDisplay = displayDate === 'added'
        ? game.createdAt
        : displayDate === 'updated'
            ? game.updatedAt
            : null;

    return (
        <Card sx={{
            width: "100%",
            height: "100%",
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 2,
            transition: 'transform 0.4s ease-out, box-shadow 0.4s ease-out',
            '&:hover': {
                transform: "scale(1.05)",
                boxShadow: '0 0 20px rgba(102, 192, 244, 0.4)',
                '& .game-card-content': { animation: `${glassBlur} 0.3s forwards` }
            },
            '& .game-card-content': { animation: `${glassBlur} 0.3s reverse forwards` }
        }}>
            <Image
                src={game.coverImage}
                alt={game.title}
                fill
                sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 20vw"
                style={{
                    objectFit: 'cover',
                    zIndex: 0,
                    filter: 'brightness(0.7)',
                }}
            />
            <CardContent
                className="game-card-content"
                sx={{
                    position: 'absolute', bottom: 0, left: 0, width: '100%',
                    flexGrow: 1, display: 'flex', flexDirection: 'column',
                    backgroundColor: 'rgba(15, 25, 34, 0.4)',
                    backdropFilter: 'blur(0px)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    p: 2, color: '#e0e0e0', zIndex: 1,
                }}
            >
                {/* ADDED: Conditional Date Display */}
                {dateToDisplay && (
                    <Typography variant="caption" sx={{ color: 'grey.400', mb: 1, display: 'block', textAlign: 'right' }}>
                        {displayDate === 'added' ? 'Added: ' : 'Updated: '} {formatDate(dateToDisplay)}
                    </Typography>
                )}

                <Typography variant="h6" noWrap sx={{ color: '#ffffff' }}>{game.title}</Typography>
                {hasTags && (<Box sx={{ my: 1 }}>{game.tags.slice(0, 2).map((tag) => (<Chip key={tag._id} label={tag.name} size="small" sx={{ mr: 0.5, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }} />))}</Box>)}
                <Box sx={{ mt: 'auto', pt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, minHeight: '24px' }}>
                        {/* ... Rating logic ... */}
                    </Box>
                    {hasFullDetails && (<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{isOnSale ? (
                        <>
                            {/* Sale price JSX... */}
                            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: '#000000', backgroundColor: '#66c0f4', fontWeight: '400', borderRadius: '4px', px: 1 }}>
                                ₹{game.basePrice}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ color: '#a0e75a', fontWeight: 'bold' }}>
                                ₹{game.salePrice}
                            </Typography>
                        </>
                    ) : (
                        // ADD THIS PART BACK
                        <Typography variant="subtitle1" sx={{ color: '#66c0f4', fontWeight: 'bold' }}>
                            ₹{game.basePrice}
                        </Typography>
                    )}
                    </Box>)}
                    {hasDeveloper && (<Typography variant="caption" sx={{ color: 'grey.500', mt: 1, display: 'block' }}>Developed by: {game.developer.firstName} {game.developer.lastName}</Typography>)}
                </Box>
            </CardContent>
        </Card>
    );
};