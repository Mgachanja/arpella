import React, { useState, useEffect, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsAndRelated } from '../../redux/slices/productsSlice';
import NavBar from '../../components/Nav';
import ProductContainer from '../../components/ProductContainer';
import successToast from '../UserNotifications/successToast';
import { addItemToCart } from '../../redux/slices/cartSlice';
import { v4 as uuidv4 } from 'uuid';
import {
  Box,
  Backdrop,
  CircularProgress,
  Paper,
  Typography,
  TextField,
  Container as MuiContainer,
  Button as MuiButton
} from '@mui/material';
import { styled } from '@mui/system';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Row, Col } from 'react-bootstrap';

const CenteredContainer = styled(MuiContainer)({
  maxWidth: '1400px',
  margin: '0 auto',
  paddingTop: '24px',
  paddingBottom: '24px'
});

// Professional category button styling
const CategoryButton = styled(MuiButton)(({ theme, isSelected }) => ({
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  padding: '8px 20px',
  margin: '3px',
  borderRadius: 0,
  border: 'none',
  borderBottom: isSelected ? '3px solid #1976d2' : '3px solid transparent',
  backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
  color: isSelected ? '#1976d2' : '#424242',
  transition: 'all 0.3s ease',
  position: 'relative',
  minHeight: '40px',
  '&:hover': {
    backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.12)' : 'rgba(66, 66, 66, 0.04)',
    borderBottom: isSelected ? '3px solid #1976d2' : '3px solid rgba(25, 118, 210, 0.3)',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-3px',
    left: '50%',
    width: isSelected ? '100%' : '0%',
    height: '3px',
    backgroundColor: '#1976d2',
    transform: 'translateX(-50%)',
    transition: 'width 0.3s ease'
  }
}));

// Professional subcategory button styling
const SubcategoryButton = styled(MuiButton)(({ theme, isSelected }) => ({
  fontWeight: 500,
  fontSize: '0.95rem',
  textTransform: 'none',
  padding: '6px 16px',
  margin: '3px 6px',
  borderRadius: 0,
  border: 'none',
  borderLeft: isSelected ? '4px solid #1976d2' : '4px solid transparent',
  backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.06)' : 'rgba(245, 245, 245, 0.8)',
  color: isSelected ? '#1976d2' : '#555',
  transition: 'all 0.25s ease',
  minWidth: '120px',
  minHeight: '36px',
  '&:hover': {
    backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.04)',
    borderLeft: isSelected ? '4px solid #1976d2' : '4px solid rgba(25, 118, 210, 0.4)',
    transform: 'translateX(2px)',
    boxShadow: '2px 2px 6px rgba(0,0,0,0.08)'
  }
}));

// Professional subcategory title styling
const SubcategoryTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.3rem',
  fontWeight: 700,
  color: '#2c3e50',
  textAlign: 'center',
  marginBottom: '16px',
  position: 'relative',
  letterSpacing: '0.5px',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-6px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '70px',
    height: '2px',
    background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
    borderRadius: '2px'
  }
}));

export default function ProductIndex() {
  const dispatch = useDispatch();
  const { products, categories, subcategories, loading } = useSelector(s => s.products);
  const cart = useSelector(s => s.cart.items);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSub, setSelectedSub] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalProd, setModalProd] = useState(null);

  useEffect(() => {
    dispatch(fetchProductsAndRelated());
  }, [dispatch]);

  useEffect(() => {
    let list = products;
    if (selectedCategory !== 'All') {
      list = list.filter(p => p.category === selectedCategory.id);
    }
    if (selectedSub) {
      list = list.filter(p => p.subcategory === selectedSub.id);
    }
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(t));
    }
    setFiltered(list);
  }, [products, selectedCategory, selectedSub, searchTerm]);

  const subsOf = cat =>
    subcategories.filter(sc => sc.categoryId === cat.id);

  const onAdd = () => {
    const id = modalProd.id || uuidv4();
    dispatch(addItemToCart({ product: { id, quantity: modalProd.quantity } }));
    successToast('Added to cart');
    setShowModal(false);
  };

  const handleImageLoad = (productId, productName) => {
    console.log(`Successfully loaded image for product: ${productName} (ID: ${productId})`);
  };

  const handleImageError = (productId, productName) => {
    console.error(`Failed to load image for product: ${productName} (ID: ${productId})`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar />

      <CenteredContainer>
        <TextField
          fullWidth
          placeholder="Search products..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          variant="outlined"
          sx={{ mb: 3 }}
          InputProps={{ sx: { fontSize: '1.1rem', padding: '12px' } }}
        />

        {/* Enhanced Categories Navigation */}
        <Paper
          elevation={6}
          sx={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '8px',
            p: 2.5,
            mb: 3,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              mb: 1.5,
              fontSize: '1.15rem',
              fontWeight: 600,
              color: '#2c3e50',
              letterSpacing: '0.3px'
            }}
          >
            Product Categories
          </Typography>
          
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1
            }}
          >
            <CategoryButton
              isSelected={selectedCategory === 'All'}
              onClick={() => { setSelectedCategory('All'); setSelectedSub(null); }}
            >
              All Products
            </CategoryButton>
            {categories.map(cat => (
              <CategoryButton
                key={cat.id}
                isSelected={selectedCategory.id === cat.id}
                onClick={() => { setSelectedCategory(cat); setSelectedSub(null); }}
              >
                {cat.categoryName}
              </CategoryButton>
            ))}
          </Box>
        </Paper>

        {/* Enhanced Subcategories Navigation */}
        {selectedCategory !== 'All' && subsOf(selectedCategory).length > 0 && (
          <Paper
            elevation={4}
            sx={{
              background: 'linear-gradient(135deg, #fafbfc 0%, #f5f6fa 100%)',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: '8px',
              p: 2.5,
              mb: 3,
              boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
            }}
          >
            <SubcategoryTitle>
              Explore {selectedCategory.categoryName}
            </SubcategoryTitle>
            
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 1,
                mt: 1.5
              }}
            >
              {subsOf(selectedCategory).map(sc => (
                <SubcategoryButton
                  key={sc.id}
                  isSelected={selectedSub?.id === sc.id}
                  onClick={() => setSelectedSub(selectedSub?.id === sc.id ? null : sc)}
                >
                  {sc.subcategoryName}
                </SubcategoryButton>
              ))}
            </Box>
          </Paper>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
              lg: 'repeat(6, 1fr)'
            },
            gap: 3,
            mt: 4,
            justifyContent: 'center'
          }}
        >
          {filtered.length === 0 ? (
            <Typography align="center" sx={{ gridColumn: '1/-1', fontSize: '1.3rem' }}>
              No products found.
            </Typography>
          ) : (
            <Suspense fallback={<CircularProgress sx={{ gridColumn: '1/-1', justifySelf: 'center' }} />}>
              {filtered.map(p => (
                <Box
                  key={p.id}
                  onClick={() => {
                    const ic = cart[p.id];
                    setModalProd({ ...p, quantity: ic ? ic.quantity : 1 });
                    setShowModal(true);
                  }}
                >
                  <ProductContainer product={p} />
                </Box>
              ))}
            </Suspense>
          )}
        </Box>
      </CenteredContainer>

      <Box component="footer" sx={{ mt: 'auto', py: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
        <Typography variant="body2">Contact: 0704288802</Typography>
        <Typography variant="body2">
          <a href="/terms-and-conditions">Terms &amp; Conditions</a> |{' '}
          <a href="/privacy-policy">Privacy Policy</a>
        </Typography>
        <Typography variant="caption">© {new Date().getFullYear()} All rights reserved.</Typography>
      </Box>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        {modalProd && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{modalProd.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col xs={6}>
                  <img
                    src={modalProd.imageUrl || 'placeholder.jpg'}
                    alt={modalProd.name}
                    style={{ width: '100%', maxHeight: 240, objectFit: 'cover' }}
                    onLoad={() => handleImageLoad(modalProd.id, modalProd.name)}
                    onError={() => handleImageError(modalProd.id, modalProd.name)}
                  />
                </Col>
                <Col xs={6}>
                  <Typography variant="h6">KSH {modalProd.price}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => setModalProd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                    >−</Button>
                    <Typography sx={{ fontSize: '1.1rem' }}>{modalProd.quantity}</Typography>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="ms-2"
                      onClick={() => setModalProd(p => ({ ...p, quantity: p.quantity + 1 }))}
                    >+</Button>
                  </Box>
                  <Button variant="primary" className="mt-3 w-100" onClick={onAdd}>
                    Update Cart
                  </Button>
                </Col>
              </Row>
            </Modal.Body>
          </>
        )}
      </Modal>

      <Backdrop sx={{ color: '#fff', zIndex: t => t.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" size={60} />
      </Backdrop>
    </Box>
  );
}