// pages/browse/developer/index.tsx
import { Box, Typography, TextField, Autocomplete, Divider } from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { useDevelopersQuery } from '@/customHooks/home.hooks.query';
import { Developer } from '@/typescript/homeTypes';
import { useMemo } from 'react';
import { Loading } from '@/components/common/Loading';
// 1. Import the RandomDeveloperCarousels component
import { RandomDeveloperCarousels } from '@/components/RandomDeveloperCarousels';

// Configure the filter options
const filter = createFilterOptions<Developer>();

const BrowseByDeveloperPage = () => {
  const router = useRouter();
  const { data: developersResult, isLoading, isError } = useDevelopersQuery();
  const allDevelopers = developersResult?.data || [];
  
  const categories = useMemo(() => [
    { key: "recentlyAdded", label: "Recently Added" },
    { key: "recentlyUpdated", label: "Recently Updated" },
    { key: "byGenre", label: "By Genre" },
    { key: "byDeveloper", label: "By Developer" },
  ], []);


  const handleDeveloperSelect = (event: any, developer: Developer | null) => {
    if (developer) {
      router.push(`/developers/${developer._id}`);
    }
  };

  return (
    <>
      <Head>
        <title>Browse by Developer | LaggedOut</title>
      </Head>
      <Box display="flex">
        <Sidebar categories={categories} />
        
        <Box 
          sx={{ 
            marginLeft: '240px', 
            p: 4, 
            flex: 1, 
            color: '#fff',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1f2a38 0%, #101820 100%)',
          }}
        >
          <Typography variant="h4" fontWeight={700} mb={4}>
            Browse by Developer
          </Typography>

          {isLoading && <Loading />}
          {isError && <Typography color="error">Could not load developers.</Typography>}

          {!isLoading && !isError && (
            <>
              <Autocomplete
                options={allDevelopers}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                onChange={handleDeveloperSelect}
                sx={{ maxWidth: 500 }}
                filterOptions={(options, state) => {
                  if (state.inputValue === '') {
                    return options.slice(0, 5);
                  }
                  return filter(options, state);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search for a developer..."
                    variant="outlined"
                    sx={{
                      '& .MuiInputLabel-root': { color: 'grey.500' },
                      '& .MuiOutlinedInput-root': {
                        color: '#fff',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                        '&:hover fieldset': { borderColor: '#66c0f4' },
                      },
                      '& .MuiSvgIcon-root': { color: '#fff' }
                    }}
                  />
                )}
              />

              {/* 2. Add the Featured Developers section below the search */}
              <Divider sx={{ my: 5, borderColor: 'rgba(255, 255, 255, 0.12)' }} />

              <Typography variant="h5" fontWeight={600} mb={3}>
                Featured Developers
              </Typography>

              <RandomDeveloperCarousels />
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default BrowseByDeveloperPage;