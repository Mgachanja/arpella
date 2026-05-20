import React from 'react';
import NavBar from '../../components/Nav';
import { Box, Typography, Container } from '@mui/material';

export default function CategoriesPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f9fafb' }}>
      <NavBar />
      <Container sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 4 }}>Our Categories</Typography>
        <Typography variant="h6" color="text.secondary">
          Explore our wide range of categories. (Coming soon)
        </Typography>
      </Container>
    </Box>
  );
}
