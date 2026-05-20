import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/Nav';
import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material';
import { styled } from '@mui/system';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StorefrontIcon from '@mui/icons-material/Storefront';

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #c85d00 0%, #492301 100%)',
  color: 'white',
  padding: '120px 20px',
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
  }
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: '40px 20px',
  textAlign: 'center',
  borderRadius: '16px',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  }
}));

const Footer = styled(Box)(({ theme }) => ({
  backgroundColor: '#111827',
  color: 'white',
  padding: '60px 20px',
  textAlign: 'center',
}));

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f9fafb' }}>
      <NavBar />
      
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2.5rem', md: '4rem' } }}>
            Arpella Stores
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, opacity: 0.95, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
            Wholesale & Retail Shop in Ngong Matasia
          </Typography>
          <Typography variant="h6" sx={{ mb: 5, opacity: 0.9, fontWeight: 400, maxWidth: '700px', mx: 'auto' }}>
            Affordable groceries, household essentials, and everyday products for homes and businesses. 
            Quality products, delivered with care.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/shop')}
              sx={{ 
                bgcolor: 'white', 
                color: '#c85d00', 
                px: 4, 
                py: 1.5, 
                fontWeight: 700,
                borderRadius: '50px',
                fontSize: '1.1rem',
                '&:hover': { bgcolor: '#f3f4f6' }
              }}
            >
              Shop Now
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => navigate('/contact')}
              sx={{ 
                borderColor: 'white', 
                color: 'white', 
                px: 4, 
                py: 1.5, 
                fontWeight: 700,
                borderRadius: '50px',
                fontSize: '1.1rem',
                borderWidth: '2px',
                '&:hover': { borderWidth: '2px', borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Contact Us
            </Button>
          </Box>
        </Container>
      </HeroSection>

      {/* Trust Indicators Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 800, mb: 6, color: '#111827' }}>
            Why Choose Us
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard elevation={0}>
                <StorefrontIcon sx={{ fontSize: 60, color: '#c85d00', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1f2937' }}>
                  Wholesale & Retail
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Supplying both individual households and businesses with bulk options.
                </Typography>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard elevation={0}>
                <LocalShippingIcon sx={{ fontSize: 60, color: '#c85d00', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1f2937' }}>
                  Fast Service
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Quick and reliable delivery ensuring you get what you need on time.
                </Typography>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard elevation={0}>
                <AttachMoneyIcon sx={{ fontSize: 60, color: '#c85d00', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1f2937' }}>
                  Affordable Prices
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Competitive pricing to give you the best value for your money.
                </Typography>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard elevation={0}>
                <LocationOnIcon sx={{ fontSize: 60, color: '#c85d00', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1f2937' }}>
                  Located in Ngong Matasia
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Conveniently located to serve the local community efficiently.
                </Typography>
              </FeatureCard>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured CTA */}
      <Box sx={{ py: 8, bgcolor: 'white', textAlign: 'center' }}>
        <Container maxWidth="sm">
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: '#111827' }}>
            Ready to explore our products?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#6b7280', fontSize: '1.1rem' }}>
            Browse through our wide selection of affordable groceries and household essentials.
          </Typography>
          <Button 
            variant="contained"
            onClick={() => navigate('/shop')}
            sx={{ 
              bgcolor: '#0057c8', 
              px: 6, 
              py: 1.5, 
              borderRadius: '50px',
              fontWeight: 700,
              fontSize: '1.1rem',
              '&:hover': { bgcolor: '#004299' }
            }}
          >
            Go to Shop
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Footer>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ textAlign: 'left', mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Arpella Stores</Typography>
              <Typography variant="body2" sx={{ color: '#9ca3af', maxWidth: '300px' }}>
                Your trusted wholesale and retail shop in Ngong Matasia. Quality and affordability combined.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Quick Links</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <a href="/shop" style={{ color: '#9ca3af', textDecoration: 'none' }}>Shop</a>
                <a href="/about" style={{ color: '#9ca3af', textDecoration: 'none' }}>About Us</a>
                <a href="/contact" style={{ color: '#9ca3af', textDecoration: 'none' }}>Contact</a>
                <a href="/terms-and-conditions" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms & Conditions</a>
                <a href="/privacy-policy" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy Policy</a>
                <a href="/delivery-terms" style={{ color: '#9ca3af', textDecoration: 'none' }}>Delivery Terms</a>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Contact Us</Typography>
              <Typography variant="body2" sx={{ color: '#9ca3af', mb: 1 }}>Phone: 0704288802</Typography>
              <Typography variant="body2" sx={{ color: '#9ca3af', mb: 1 }}>Location: Ngong Matasia</Typography>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>Business Hours: 8:00 AM - 8:00 PM</Typography>
            </Grid>
          </Grid>
          <Box sx={{ pt: 4, borderTop: '1px solid #374151', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#9ca3af' }}>
              © {new Date().getFullYear()} Arpella Stores. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Footer>
    </Box>
  );
}
