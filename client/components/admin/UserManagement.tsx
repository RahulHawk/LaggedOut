import React, { useState } from 'react';
import { AdminProfileData, UserListItem } from '@/typescript/adminTypes';
import {
  Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
  Menu, MenuItem, IconButton, ListItemIcon
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import TaskAltIcon from '@mui/icons-material/TaskAlt'; // Import new icon
import { useAdminMutations } from '@/customHooks/admin.hooks.query';
import { BanUserModal } from './BanUserModal';

interface Props {
  profileData?: AdminProfileData;
}

// A reusable table for displaying users
const UserTable = ({ title, users, userType }: { title: string, users: UserListItem[], userType: 'player' | 'developer' }) => {
  const { promoteToDeveloper, approveDeveloper } = useAdminMutations();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [banModalState, setBanModalState] = useState({ open: false, action: 'ban' as 'ban' | 'unban' });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, user: UserListItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handlePromote = () => {
    if (selectedUser) promoteToDeveloper(selectedUser.id);
    handleMenuClose();
  };

  // FIX: Add a handler for approving a developer
  const handleApproveDeveloper = () => {
    if (selectedUser) approveDeveloper(selectedUser.id);
    handleMenuClose();
  };

  const openBanModal = (action: 'ban' | 'unban') => {
    setBanModalState({ open: true, action });
    handleMenuClose();
  };

  return (
    <>
      <Paper sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ p: 2 }}>{title}</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name} ({user.email})</TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={user.status === 'Banned' ? 'error' : (user.status === 'Active' ? 'success' : 'warning')}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => handleMenuClick(e, user)}><MoreVertIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} >
        {/* FIX: Conditionally show "Approve Developer" button */}
        {userType === 'developer' && selectedUser?.status === 'Pending' && (
          <MenuItem onClick={handleApproveDeveloper}>
            <ListItemIcon><TaskAltIcon fontSize="small" color="success" /></ListItemIcon>
            Approve Developer
          </MenuItem>
        )}

        {selectedUser?.status !== 'Banned' && (
          <MenuItem onClick={() => openBanModal('ban')}>
            <ListItemIcon><BlockIcon fontSize="small" color="error" /></ListItemIcon>
            Ban User
          </MenuItem>
        )}
        {selectedUser?.status === 'Banned' && (
          <MenuItem onClick={() => openBanModal('unban')}>
            <ListItemIcon><CheckCircleOutlineIcon fontSize="small" color="success" /></ListItemIcon>
            Unban User
          </MenuItem>
        )}
        {userType === 'player' && (
          <MenuItem onClick={handlePromote}>
            <ListItemIcon><ArrowUpwardIcon fontSize="small" /></ListItemIcon>
            Promote to Developer
          </MenuItem>
        )}
      </Menu>

      {selectedUser && (
        <BanUserModal
          open={banModalState.open}
          onClose={() => setBanModalState({ open: false, action: 'ban' })}
          userId={selectedUser.id}
          userName={selectedUser.name}
          action={banModalState.action}
        />
      )}
    </>
  );
};

export const UserManagement: React.FC<Props> = ({ profileData }) => {
  if (!profileData) return null;
  return (
    <>
      <UserTable title="Developers" users={profileData.developers} userType="developer" />
      <UserTable title="Players" users={profileData.players} userType="player" />
    </>
  );
};