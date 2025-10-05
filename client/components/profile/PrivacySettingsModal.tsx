import React, { useState } from 'react';
import { Box, Typography, Modal, Button, RadioGroup, FormControlLabel, Radio, FormControl } from '@mui/material';
// TODO: Implement the API endpoint and the corresponding mutation hook to save the privacy setting.
// import { useUpdatePrivacyMutation } from '@/customHooks/profile.hooks.mutation';

export const PrivacySettingsModal = ({ open, handleClose, profile }: { open: boolean, handleClose: () => void, profile: any }) => {
  const [privacy, setPrivacy] = useState(profile.profile.privacy || 'public');
  // const { mutate: updatePrivacy, isLoading } = useUpdatePrivacyMutation();

  const handleSave = () => {
    // This is where you would call your mutation
    // updatePrivacy({ privacy }, { onSuccess: () => handleClose() });

    alert(`NOTE FOR DEVELOPER: This is a placeholder. Implement the API and mutation hook to save the selected privacy setting: "${privacy}".`);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2">Profile Privacy</Typography>
        <Typography sx={{ mt: 1, mb: 2 }}>Control who can see your profile details.</Typography>
        <FormControl component="fieldset">
          <RadioGroup
            aria-label="privacy"
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
          >
            <FormControlLabel value="public" control={<Radio />} label="Public (Visible to everyone)" />
            <FormControlLabel value="friends" control={<Radio />} label="Friends Only (Visible to your friends)" />
            <FormControlLabel value="private" control={<Radio />} label="Private (Visible only to you)" />
          </RadioGroup>
        </FormControl>
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
            Note: Your profile is always visible to administrators for support and moderation purposes.
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} /* disabled={isLoading} */>
            Save Changes
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const modalStyle = {
  position: 'absolute' as 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: { xs: '90%', md: 500 }, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
};