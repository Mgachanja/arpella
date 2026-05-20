import React from 'react';
import NavBar from '../../components/Nav';
import { Box, Typography, Container, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function CheckoutPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f9fafb' }}>
      <NavBar />
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper elevation={0} sx={{ p: 6, borderRadius: '16px', textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 4 }}>Checkout</Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            Your checkout flow will appear here. (Coming soon)
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/shop')}
            sx={{ bgcolor: '#c85d00', '&:hover': { bgcolor: '#a84c00' } }}
          >
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
