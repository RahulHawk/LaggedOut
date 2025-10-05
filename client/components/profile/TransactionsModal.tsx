import React from 'react';
import { useMyPurchaseHistoryQuery } from '@/customHooks/commerce.hooks.query';
import { useMyRefundsQuery } from '@/customHooks/refund.hooks.query';
import { Box, Typography, Modal, CircularProgress, Tabs, Tab, List, ListItem, ListItemText, Chip } from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`transaction-tabpanel-${index}`} aria-labelledby={`transaction-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const getStatusChip = (status: string) => {
    switch (status) {
        case 'pending': return <Chip label="Pending" color="warning" size="small" />;
        case 'approved': return <Chip label="Approved" color="success" size="small" />;
        case 'rejected': return <Chip label="Rejected" color="error" size="small" />;
        default: return <Chip label={status} size="small" />;
    }
}

export const TransactionsModal = ({ open, handleClose }: { open: boolean, handleClose: () => void }) => {
  const [tabIndex, setTabIndex] = React.useState(0);
  const { data: purchases, isLoading: isLoadingPurchases } = useMyPurchaseHistoryQuery();
  const { data: refunds, isLoading: isLoadingRefunds } = useMyRefundsQuery();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2">Transaction History</Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={handleTabChange} aria-label="transaction tabs">
            <Tab label="Purchase History" id="transaction-tab-0" />
            <Tab label="Refund History" id="transaction-tab-1" />
          </Tabs>
        </Box>
        <TabPanel value={tabIndex} index={0}>
          {isLoadingPurchases ? <CircularProgress /> : (
            <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
              {purchases?.length ? purchases.map(p => (
                <ListItem key={p._id} divider>
                  <ListItemText
                    primary={`${p.game.title} - ${p.edition}`}
                    secondary={`Purchased on ${new Date(p.purchasedAt).toLocaleDateString()} for ₹${p.pricePaid}`}
                  />
                </ListItem>
              )) : <Typography>No purchase history found.</Typography>}
            </List>
          )}
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          {isLoadingRefunds ? <CircularProgress /> : (
            <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                {refunds?.length ? refunds.map(r => (
                    <ListItem key={r._id} divider sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <ListItemText
                            primary={r.purchase ? `${r.purchase.game.title} - ${r.purchase.edition}` : 'Game not found'}
                            secondary={`Requested on ${new Date(r.createdAt).toLocaleDateString()}`}
                        />
                        {getStatusChip(r.status)}
                    </ListItem>
                )) : <Typography>No refund history found.</Typography>}
            </List>
          )}
        </TabPanel>
      </Box>
    </Modal>
  );
};

const modalStyle = {
  position: 'absolute' as 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: { xs: '90%', md: 600 }, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
};