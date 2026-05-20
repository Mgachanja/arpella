import React from 'react';
import NavBar from '../../components/Nav';
import { Box, Typography, Container, Paper, Grid } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

export default function ContactPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f9fafb' }}>
      <NavBar />
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper elevation={0} sx={{ p: 6, borderRadius: '16px' }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 4, textAlign: 'center' }}>Contact Us</Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <LocationOnIcon sx={{ fontSize: 40, color: '#c85d00', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Location</Typography>
              <Typography variant="body2" color="text.secondary">Ngong Matasia</Typography>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <PhoneIcon sx={{ fontSize: 40, color: '#c85d00', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Phone</Typography>
              <Typography variant="body2" color="text.secondary">0704288802</Typography>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <EmailIcon sx={{ fontSize: 40, color: '#c85d00', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Email</Typography>
              <Typography variant="body2" color="text.secondary">arpelastoressystem@gmail.com</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
