import React, { useState } from 'react';
import { TextField, Button, Typography } from '@mui/material';
import { toast } from 'react-toastify'; // Importing toast
import 'react-toastify/dist/ReactToastify.css'; // Importing styles for toast notifications

const Settings = () => {
  const [activeHours, setActiveHours] = useState({
    openingTime: '09:00',
    closingTime: '18:00',
  });

  const handleSaveSettings = () => {
    if (!activeHours.openingTime || !activeHours.closingTime) {
      toast.error('Please set both opening and closing times.');
      return;
    }
    toast.success('Settings saved successfully!');
    // Handle logic to save the settings here (e.g., saving to the server or local storage)
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: '#2d2d2d' }}>
        Store Settings
      </Typography>

      {/* Store Active Hours Form */}
      <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
        Set Store Active Hours
      </Typography>
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <TextField
          label="Opening Time"
          type="time"
          value={activeHours.openingTime}
          onChange={(e) => setActiveHours({ ...activeHours, openingTime: e.target.value })}
          sx={{ marginRight: '10px', width: '200px' }}
        />
        <TextField
          label="Closing Time"
          type="time"
          value={activeHours.closingTime}
          onChange={(e) => setActiveHours({ ...activeHours, closingTime: e.target.value })}
          sx={{ width: '200px' }}
        />
      </div>
      <Button variant="contained" color="primary" onClick={handleSaveSettings}>
        Save Settings
      </Button>
    </div>
  );
};

export default Settings;
