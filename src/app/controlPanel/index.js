import React, { useState } from 'react';
import { useSelector } from 'react-redux'; // Get role from Redux state
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBox, faUserPlus, faComments, faClipboardList, faCog, faMoneyBill } from '@fortawesome/free-solid-svg-icons';
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
  const { user } = useSelector((state) => state.auth); // Get user info

  const role = user?.role || 'Customer'; // Default role is customer (no access)

  const allowedRoutes = {
    "Admin": ['Home', 'Stock Management', 'Add Staff', 'Customer Feedback', 'Orders', 'Settings', 'Accounts'],
    "Order_Manager": ['Home','Orders'],
    Accountant: ['Home','Accounts'],
    Customer: [],
    "Delivery Guy": [],
  };

  const renderContent = () => {
    if (!allowedRoutes[role].includes(selectedMenu)) return toast.error("Access denied");

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

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', backgroundColor: '#f8f9fa' },
        }}
      >
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
            .filter((item) => allowedRoutes[role].includes(item.text)) // Filter menu items based on role
            .map(({ text, icon }) => (
              <ListItem key={text} disablePadding>
                <ListItemButton
                  onClick={() => setSelectedMenu(text)}
                  sx={{
                    backgroundColor: selectedMenu === text ? '#ff5733' : 'transparent',
                    color: selectedMenu === text ? '#ffffff' : '#000000',
                    '&:hover': { backgroundColor: selectedMenu === text ? '#0056b3' : '#e9ecef' },
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
      </Drawer>

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: '20px' }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
