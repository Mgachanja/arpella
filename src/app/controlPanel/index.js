import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faBox,
  faUserPlus,
  faComments,
  faClipboardList,
  faCog,
  faMoneyBill,
} from '@fortawesome/free-solid-svg-icons';
import Home from './home';
import Stock from './stockManagement';
import Staff from './staff';
import CustomerFeedback from './feedback';
import OrderManagement from './orderManagement';
import Settings from './settings';
import Accounts from './account';
import { toast } from 'react-toastify';

const drawerWidth = 250;

const Dashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState('Home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || 'Customer';

  const allowedRoutes = {
    Admin: ['Home', 'Stock Management', 'Add Staff', 'Customer Feedback', 'Orders', 'Settings', 'Accounts'],
    Order_Manager: ['Home','Orders'],
    Accountant: ['Home','Accounts'],
    Customer: [],
    'Delivery Guy': [],
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const renderContent = () => {
    if (!allowedRoutes[role].includes(selectedMenu)) {
      toast.error("Access denied");
      return (
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" color="error">
            Access Denied
          </Typography>
        </Box>
      );
    }
    switch (selectedMenu) {
      case 'Home':
        return <Home />;
      case 'Stock Management':
        return <Stock />;
      case 'Add Staff':
        return <Staff />;
      case 'Customer Feedback':
        return <CustomerFeedback />;
      case 'Orders':
        return <OrderManagement />;
      case 'Settings':
        return <Settings />;
      case 'Accounts':
        return <Accounts />;
      default:
        return <Home />;
    }
  };

  const drawer = (
    <Box>
      <Toolbar />
      <List>
        {[
          { text: 'Home', icon: faHome },
          { text: 'Stock Management', icon: faBox },
          { text: 'Add Staff', icon: faUserPlus },
          { text: 'Customer Feedback', icon: faComments },
          { text: 'Orders', icon: faClipboardList },
          { text: 'Settings', icon: faCog },
          { text: 'Accounts', icon: faMoneyBill },
        ]
          .filter((item) => allowedRoutes[role].includes(item.text))
          .map(({ text, icon }) => (
            <ListItem key={text} disablePadding>
              <ListItemButton
                onClick={() => {
                  setSelectedMenu(text);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  backgroundColor: selectedMenu === text ? '#ff5733' : 'transparent',
                  color: selectedMenu === text ? '#ffffff' : '#000000',
                  '&:hover': {
                    backgroundColor: selectedMenu === text ? '#0056b3' : '#e9ecef',
                  },
                }}
              >
                <ListItemIcon sx={{ color: selectedMenu === text ? '#ffffff' : '#000000' }}>
                  <FontAwesomeIcon icon={icon} />
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar for Mobile */}
      {isMobile && (
        <AppBar position="fixed" sx={{ width: '100%' }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar Drawer */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="sidebar">
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                backgroundColor: '#f8f9fa',
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                backgroundColor: '#f8f9fa',
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          // On small screens, no margin; on larger screens, shift right by drawer width
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          overflow: 'auto',
        }}
      >
        {isMobile && <Toolbar />}
        {renderContent()}
      </Box>
    </Box>
  );
};

export default Dashboard;
