import { useState, useMemo } from 'react';
import { Box, Typography, Button, Badge, Stack } from '@mui/material';
import { useMyProfileQuery } from '@/customHooks/profile.hooks.query';

import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { ShowcaseSection } from '@/components/profile/ShowcaseSection';
import { ActivityFeed } from '@/components/profile/ActivityFeed';
import { SettingsModal } from '@/components/profile/SettingsModal';
import { CustomizeShowcaseModal } from '@/components/profile/CustomizeShowcaseModal';
import { BadgesShowcase } from '@/components/profile/BadgesShowcase';
import { ProfileLoading } from '@/components/common/ProfileLoading';
import { AvatarSelectModal } from '@/components/profile/AvatarSelectModal';
import { TransactionsModal } from '@/components/profile/TransactionsModal';
import { PrivacySettingsModal } from '@/components/profile/PrivacySettingsModal';
import Head from 'next/head';

const PlayerProfile = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showcaseOpen, setShowcaseOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  
  const { data: profile, isLoading, isError } = useMyProfileQuery();

  const libraryGamesForShowcase = useMemo(() => {
    if (!profile?.library) return [];
    return profile.library.map(item => item.game).filter(Boolean);
  }, [profile]);

  if (isLoading) return <ProfileLoading />;
  if (isError || !profile) return <Typography color="error">Could not load profile.</Typography>;

  return (
    <>
    <Head>
      <title>{profile.displayName}'s Profile | LaggedOut</title>
    </Head>
      <Box sx={{ p: 3, background: 'linear-gradient(135deg, #1f2a38 0%, #101820 100%)', minHeight: '100vh' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <ProfileHeader user={profile} onAvatarClick={() => setAvatarModalOpen(true)} />
          <Stack direction="column" spacing={1} alignItems="flex-end">
            <Badge color="error" variant="dot" invisible={profile.isUsernameSet}>
              <Button variant="outlined" onClick={() => setSettingsOpen(true)} sx={{ flexShrink: 0, width: '160px' }}>
                Account Settings
              </Button>
            </Badge>
            <Button variant="outlined" onClick={() => setPrivacyOpen(true)} sx={{ flexShrink: 0, width: '160px' }}>
              Privacy Settings
            </Button>
            <Button variant="outlined" onClick={() => setTransactionsOpen(true)} sx={{ flexShrink: 0, width: '160px' }}>
              Transactions
            </Button>
          </Stack>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ width: { xs: '100%', md: '66.67%' } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" color="white" fontWeight={600}>Game Showcase</Typography>
              <Button size="small" onClick={() => setShowcaseOpen(true)}>Customize</Button>
            </Box>
            <ShowcaseSection items={profile.profile.showcaseGames} />
            <Box sx={{ mt: 3 }}>
              <ActivityFeed activities={profile.recentActivity} />
            </Box>
          </Box>
          <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
            <ProfileSidebar bio={profile.profile.bio} friends={profile.friends} />
            <BadgesShowcase badges={profile.inventory.badges} />
          </Box>
        </Box>
      </Box>

      {/* Render all modals */}
      {settingsOpen && <SettingsModal open={settingsOpen} handleClose={() => setSettingsOpen(false)} profile={profile} />}
      {showcaseOpen && <CustomizeShowcaseModal open={showcaseOpen} handleClose={() => setShowcaseOpen(false)} library={libraryGamesForShowcase} showcaseGames={profile.profile.showcaseGames} />}
      {avatarModalOpen && (
        <AvatarSelectModal 
            open={avatarModalOpen} 
            handleClose={() => setAvatarModalOpen(false)} 
            avatars={profile.inventory.avatars} 
        />
      )}
      {transactionsOpen && <TransactionsModal open={transactionsOpen} handleClose={() => setTransactionsOpen(false)} />}
      {privacyOpen && <PrivacySettingsModal open={privacyOpen} handleClose={() => setPrivacyOpen(false)} profile={profile} />}
    </>
  );
};

export default PlayerProfile;