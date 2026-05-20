import React from 'react';
import NavBar from '../../components/Nav';
import { Box, Typography, Container, Paper } from '@mui/material';

export default function AboutPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f9fafb' }}>
      <NavBar />
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper elevation={0} sx={{ p: 6, borderRadius: '16px' }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 4 }}>About Arpella Stores</Typography>
          <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem', color: 'text.secondary' }}>
            Arpella Stores is your premier wholesale and retail shop located in Ngong Matasia.
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem', color: 'text.secondary' }}>
            We provide affordable groceries, household essentials, and everyday products for homes and businesses. Our goal is to bring high-quality products closer to you with fast service and competitive pricing.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
