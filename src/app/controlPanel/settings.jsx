import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  CircularProgress,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { baseUrl } from '../../constants';

const Settings = () => {
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('18:00');
  const [deliveryFee, setDeliveryFee] = useState('0');

  const [settingsMap, setSettingsMap] = useState({});
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingOpening, setLoadingOpening] = useState(false);
  const [loadingClosing, setLoadingClosing] = useState(false);
  const [loadingDelivery, setLoadingDelivery] = useState(false);

  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [savingNew, setSavingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    setLoadingInit(true);
    try {
      const res = await fetch(`${baseUrl}/settings`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Failed to fetch settings: ${res.status} ${txt}`);
      }
      const data = await res.json();
      const map = {};
      if (Array.isArray(data)) {
        for (const s of data) {
          if (s?.settingName) map[s.settingName] = s;
        }
      }
      setSettingsMap(map);
      if (map['Delivery Fee']) setDeliveryFee(String(map['Delivery Fee'].settingValue ?? '0'));
      if (map['Opening Time']) setOpeningTime(String(map['Opening Time'].settingValue ?? openingTime));
      if (map['Closing Time']) setClosingTime(String(map['Closing Time'].settingValue ?? closingTime));
    } catch (err) {
      console.error(err);
      toast.error('Unable to load settings. Check network or server.');
    } finally {
      setLoadingInit(false);
    }
  };

  const validateDeliveryFee = () => {
    if (deliveryFee === '') {
      toast.error('Please enter a delivery fee.');
      return false;
    }
    const num = Number(deliveryFee);
    if (Number.isNaN(num) || num < 0) {
      toast.error('Please enter a valid non-negative delivery fee.');
      return false;
    }
    return true;
  };

  const createSetting = async (name, value) => {
    const body = { settingName: String(name), settingValue: String(value) };
    return fetch(`${baseUrl}/setting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  const updateSetting = async (id, name, value) => {
    const body = { settingName: String(name), settingValue: String(value) };
    return fetch(`${baseUrl}/setting/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  const handleSaveOpening = async () => {
    if (!openingTime) {
      toast.error('Opening time is required.');
      return;
    }
    if (closingTime && openingTime >= closingTime) {
      toast.error('Opening time must be earlier than closing time.');
      return;
    }
    setLoadingOpening(true);
    try {
      const key = 'Opening Time';
      const existing = settingsMap[key];
      const res = existing ? await updateSetting(existing.id, key, openingTime) : await createSetting(key, openingTime);
      if (!res.ok) {
        let msg = `Status ${res.status}`;
        try {
          const j = await res.json();
          if (j?.message) msg = j.message;
        } catch (_) {}
        toast.error(`Failed to save opening time: ${msg}`);
      } else {
        toast.success('Opening time saved.');
        await fetchAllSettings();
      }
    } catch (err) {
      console.error('Save opening error', err);
      toast.error('Network error while saving opening time.');
    } finally {
      setLoadingOpening(false);
    }
  };

  const handleSaveClosing = async () => {
    if (!closingTime) {
      toast.error('Closing time is required.');
      return;
    }
    if (openingTime && openingTime >= closingTime) {
      toast.error('Closing time must be later than opening time.');
      return;
    }
    setLoadingClosing(true);
    try {
      const key = 'Closing Time';
      const existing = settingsMap[key];
      const res = existing ? await updateSetting(existing.id, key, closingTime) : await createSetting(key, closingTime);
      if (!res.ok) {
        let msg = `Status ${res.status}`;
        try {
          const j = await res.json();
          if (j?.message) msg = j.message;
        } catch (_) {}
        toast.error(`Failed to save closing time: ${msg}`);
      } else {
        toast.success('Closing time saved.');
        await fetchAllSettings();
      }
    } catch (err) {
      console.error('Save closing error', err);
      toast.error('Network error while saving closing time.');
    } finally {
      setLoadingClosing(false);
    }
  };

  const handleSaveDelivery = async () => {
    if (!validateDeliveryFee()) return;
    setLoadingDelivery(true);
    try {
      const key = 'Delivery Fee';
      const existing = settingsMap[key];
      const value = String(Number(deliveryFee));
      const res = existing ? await updateSetting(existing.id, key, value) : await createSetting(key, value);
      if (!res.ok) {
        let msg = `Status ${res.status}`;
        try {
          const j = await res.json();
          if (j?.message) msg = j.message;
        } catch (_) {}
        toast.error(`Failed to save delivery fee: ${msg}`);
      } else {
        toast.success('Delivery fee saved.');
        await fetchAllSettings();
      }
    } catch (err) {
      console.error('Save delivery error', err);
      toast.error('Network error while saving delivery fee.');
    } finally {
      setLoadingDelivery(false);
    }
  };

  const validateNew = () => {
    if (!newName || !newName.trim()) {
      toast.error('Setting name is required.');
      return false;
    }
    if (newValue === '' || newValue === null) {
      toast.error('Setting value is required.');
      return false;
    }
    return true;
  };

  const handleCreateOrUpdateNew = async () => {
    if (!validateNew()) return;
    setSavingNew(true);
    try {
      if (editingId) {
        const res = await updateSetting(editingId, newName.trim(), String(newValue));
        if (!res.ok) {
          let msg = `Status ${res.status}`;
          try {
            const j = await res.json();
            if (j?.message) msg = j.message;
          } catch (_) {}
          toast.error(`Failed to update setting: ${msg}`);
        } else {
          toast.success('Setting updated.');
          setNewName('');
          setNewValue('');
          setEditingId(null);
          await fetchAllSettings();
        }
      } else {
        const res = await createSetting(newName.trim(), String(newValue));
        if (!res.ok) {
          let msg = `Status ${res.status}`;
          try {
            const j = await res.json();
            if (j?.message) msg = j.message;
          } catch (_) {}
          toast.error(`Failed to create setting: ${msg}`);
        } else {
          toast.success('Setting created.');
          setNewName('');
          setNewValue('');
          await fetchAllSettings();
        }
      }
    } catch (err) {
      console.error('Save new setting error', err);
      toast.error('Network error while saving setting.');
    } finally {
      setSavingNew(false);
    }
  };

  const handleLoadSetting = (s) => {
    if (!s) return;
    const { settingName, settingValue, id } = s;
    if (settingName === 'Delivery Fee') setDeliveryFee(String(settingValue ?? '0'));
    if (settingName === 'Opening Time') setOpeningTime(String(settingValue ?? openingTime));
    if (settingName === 'Closing Time') setClosingTime(String(settingValue ?? closingTime));
    setNewName(settingName);
    setNewValue(String(settingValue ?? ''));
    setEditingId(id ?? null);
  };

  const handleCancelEdit = () => {
    setNewName('');
    setNewValue('');
    setEditingId(null);
  };

  return (
    <Box sx={{ padding: 3, maxWidth: 980, margin: '0 auto' }}>
      <ToastContainer position="top-right" />
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
        Store Settings
      </Typography>

      {loadingInit ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography>Loading settings...</Typography>
        </Box>
      ) : (
        <>
          <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
            Opening Time
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TextField
              label="Opening Time"
              type="time"
              value={openingTime}
              onChange={(e) => setOpeningTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 200 }}
            />
            <Button
              variant="contained"
              onClick={handleSaveOpening}
              disabled={loadingOpening}
              startIcon={loadingOpening ? <CircularProgress size={18} /> : null}
            >
              {loadingOpening ? 'Saving...' : 'Save Opening'}
            </Button>
          </Box>

          <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
            Closing Time
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TextField
              label="Closing Time"
              type="time"
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 200 }}
            />
            <Button
              variant="contained"
              onClick={handleSaveClosing}
              disabled={loadingClosing}
              startIcon={loadingClosing ? <CircularProgress size={18} /> : null}
            >
              {loadingClosing ? 'Saving...' : 'Save Closing'}
            </Button>
          </Box>

          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Delivery Fee
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TextField
              label="Delivery Fee"
              type="number"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              InputProps={{ inputProps: { min: 0, step: 1 } }}
              sx={{ width: 200 }}
            />
            <Button
              variant="contained"
              onClick={handleSaveDelivery}
              disabled={loadingDelivery}
              startIcon={loadingDelivery ? <CircularProgress size={18} /> : null}
            >
              {loadingDelivery ? 'Saving...' : 'Save Delivery Fee'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 1 }}>
            Create New Setting
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
            <TextField
              label="Setting Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              sx={{ minWidth: 260 }}
            />
            <TextField
              label="Setting Value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              sx={{ minWidth: 260 }}
            />
            <Button
              variant="contained"
              onClick={handleCreateOrUpdateNew}
              disabled={savingNew}
              startIcon={savingNew ? <CircularProgress size={18} /> : null}
            >
              {editingId ? (savingNew ? 'Updating...' : 'Update Setting') : (savingNew ? 'Saving...' : 'Add Setting')}
            </Button>
            {editingId && (
              <Button variant="outlined" onClick={handleCancelEdit} sx={{ height: 40 }}>
                Cancel
              </Button>
            )}
          </Box>

          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            All Settings
          </Typography>
          <List dense>
            {Object.values(settingsMap).length === 0 ? (
              <ListItem>
                <ListItemText primary="No settings found" />
              </ListItem>
            ) : (
              Object.values(settingsMap).map((s) => (
                <ListItem
                  key={s.id}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" onClick={() => handleLoadSetting(s)}>
                        Load
                      </Button>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={`${s.settingName}`}
                    secondary={`id: ${s.id} — value: ${s.settingValue}`}
                  />
                </ListItem>
              ))
            )}
          </List>
        </>
      )}
    </Box>
  );
};

export default Settings;
