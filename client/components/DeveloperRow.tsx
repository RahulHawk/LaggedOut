// components/DeveloperRow.tsx
import { Box, Skeleton } from '@mui/material';
import { useGamesQuery } from '@/customHooks/home.hooks.query';
import { GameCarousel } from '@/components/GameCarousel';
import { Developer } from '@/typescript/homeTypes';
import { Loading } from './common/Loading';

interface DeveloperRowProps { developer: Developer; }

export const DeveloperRow: React.FC<DeveloperRowProps> = ({ developer }) => {
  const { data: gamesResult, isLoading } = useGamesQuery({
    developer: developer._id,
    limit: 5,
  });
  const games = gamesResult?.data || [];

  if (!isLoading && games.length === 0) return null;

  const developerName = `${developer.firstName} ${developer.lastName}`;

  return (
    <Box mb={4}>
      {isLoading ? (
        <>
          <Loading />
        </>
      ) : (
        <GameCarousel 
          title={developerName} 
          games={games} 
          showAllLink={`/developers/${developer._id}`} 
        />
      )}
    </Box>
  );
};