// src/pages/ProductIndex.js
import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsAndRelated, setProducts, fetchProductsApi } from '../../redux/slices/productsSlice';
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
  Button as MuiButton,
  Alert
} from '@mui/material';
import { styled } from '@mui/system';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Row, Col } from 'react-bootstrap';
import { useInfiniteQuery } from '@tanstack/react-query';

// Styled container for consistent layout width
const CenteredContainer = styled(MuiContainer)({
  maxWidth: '1400px',
  margin: '0 auto',
  paddingLeft: '16px',
  paddingRight: '16px',
  paddingTop: '16px',
  paddingBottom: '16px'
});

// Styled category selection buttons
const CategoryButton = styled(MuiButton)(({ isSelected }) => ({
  fontWeight: 600,
  fontSize: '0.9rem',
  textTransform: 'none',
  padding: '4px 16px',
  margin: '2px',
  borderRadius: 0,
  borderBottom: isSelected ? '3px solid #1976d2' : '3px solid transparent',
  backgroundColor: isSelected ? 'rgba(25,118,210,0.08)' : 'transparent',
  color: isSelected ? '#1976d2' : '#424242',
  minHeight: '32px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: isSelected
      ? 'rgba(25,118,210,0.12)'
      : 'rgba(66,66,66,0.04)',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  }
}));

// Styled subcategory buttons for visual hierarchy
const SubcategoryButton = styled(MuiButton)(({ isSelected }) => ({
  fontWeight: 500,
  fontSize: '0.85rem',
  textTransform: 'none',
  padding: '4px 12px',
  margin: '2px 4px',
  borderRadius: 0,
  borderLeft: isSelected ? '4px solid #1976d2' : '4px solid transparent',
  backgroundColor: isSelected ? 'rgba(25,118,210,0.06)' : 'rgba(245,245,245,0.8)',
  color: isSelected ? '#1976d2' : '#555',
  minHeight: '32px',
  transition: 'all 0.25s ease',
  '&:hover': {
    backgroundColor: isSelected
      ? 'rgba(25,118,210,0.1)'
      : 'rgba(25,118,210,0.04)',
    transform: 'translateX(2px)',
    boxShadow: '2px 2px 6px rgba(0,0,0,0.08)'
  }
}));

// Section title styling for subcategories
const SubcategoryTitle = styled(Typography)({
  fontSize: '1.2rem',
  fontWeight: 700,
  color: '#2c3e50',
  textAlign: 'center',
  marginBottom: '12px',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-4px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60px',
    height: '2px',
    background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
    borderRadius: '2px'
  }
});

// Responsive products grid container with equal-sized containers
const ProductsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  width: '100%',
  gap: '16px',
  marginTop: '24px',
  justifyContent: 'center',
  justifyItems: 'center',
  // Mobile: 2 columns with fixed width containers
  gridTemplateColumns: 'repeat(2, 180px)',
  
  // Small tablets: 3 columns
  '@media (min-width: 600px)': {
    gridTemplateColumns: 'repeat(3, 180px)',
    gap: '18px'
  },
  
  // Tablets: 4 columns
  '@media (min-width: 800px)': {
    gridTemplateColumns: 'repeat(4, 180px)',
    gap: '20px'
  },
  
  // Desktop: 5 columns
  '@media (min-width: 1000px)': {
    gridTemplateColumns: 'repeat(5, 180px)',
    gap: '22px'
  },
  
  // Large desktop: 6 columns
  '@media (min-width: 1200px)': {
    gridTemplateColumns: 'repeat(6, 180px)',
    gap: '24px'
  }
}));

export default function ProductIndex() {
  const dispatch = useDispatch();
  const { products, categories, subcategories, loading, error } = useSelector(s => s.products);
  const cart = useSelector(s => s.cart.items);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSub, setSelectedSub] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalProd, setModalProd] = useState(null);

  // Pagination configuration
  const PAGE_SIZE = 50;

  // 1) Ensure categories/subcategories/inventories are loaded (small payload)
  useEffect(() => {
    dispatch(fetchProductsAndRelated());
  }, [dispatch]);

  // 2) React Query infinite fetch - FIXED for v5 syntax
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: rqLoading,
    isError: rqError,
    error: rqErrorObj
  } = useInfiniteQuery({
    queryKey: ['products', PAGE_SIZE],
    queryFn: async ({ pageParam = 1 }) => {
      // fetchProductsApi returns { items, hasMore }
      const res = await fetchProductsApi(pageParam, PAGE_SIZE);
      return res;
    },
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage) return undefined;
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
    // keep pages cached for a while
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (was cacheTime in v4)
    initialPageParam: 1 // required in v5
  });

  // Handle successful data fetching
  useEffect(() => {
    if (data) {
      // flatten and dispatch into redux store (setProducts merges by name)
      const mergedItems = data.pages.flatMap(p => (p.items || []));
      if (mergedItems.length) {
        // dispatch setProducts with entire flattened list so redux normalizes/merges
        dispatch(setProducts(mergedItems));
      }
    }
  }, [data, dispatch]);

  // Use an intersection observer sentinel to trigger fetchNextPage
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  const handleObserver = useCallback(
    entries => {
      const first = entries[0];
      if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    // disconnect old observer
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(handleObserver, { 
      root: null, 
      rootMargin: '400px', 
      threshold: 0.1 
    });
    observerRef.current.observe(el);
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [handleObserver]);

  // Filtering logic remains derived from redux products (which is kept current by react-query -> dispatch)
  useEffect(() => {
    let list = products || [];
    if (selectedCategory !== 'All') {
      list = list.filter(p => p.category === selectedCategory.id);
    }
    if (selectedSub) {
      list = list.filter(p => p.subcategory === selectedSub.id);
    }
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter(p => 
        (p.name || '').toLowerCase().includes(t) || 
        (p.categoryName || '').toLowerCase().includes(t) ||
        (p.subcategoryName || '').toLowerCase().includes(t)
      );
    }
    setFiltered(list);
  }, [products, selectedCategory, selectedSub, searchTerm]);

  const subsOf = cat =>
    subcategories.filter(sc => sc.categoryId === cat.id);

  // Add product to cart from modal
  const onAdd = () => {
    const id = modalProd.id || uuidv4();
    dispatch(addItemToCart({ 
      product: { 
        id, 
        quantity: modalProd.quantity,
        name: modalProd.name,
        price: modalProd.price,
        imageUrl: modalProd.imageUrl
      } 
    }));
    successToast('Added to cart');
    setShowModal(false);
  };

  const handleImageLoad = (productId, productName) => {
    console.log(`Loaded image for ${productName} (${productId})`);
  };
  
  const handleImageError = (productId, productName) => {
    console.error(`Image error for ${productName} (${productId})`);
  };

  // error handling: prefer react-query error if present
  const pageError = rqError ? (rqErrorObj?.message || 'Error loading product pages') : error;

  if (pageError) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <NavBar />
        <CenteredContainer>
          <Alert severity="error" sx={{ mt: 2 }}>
            Error loading products: {pageError}
          </Alert>
        </CenteredContainer>
      </Box>
    );
  }

  const isLoadingOverall = loading || rqLoading;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar />

      <CenteredContainer>
        <TextField
          fullWidth
          placeholder="Search products, categories..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
          InputProps={{
            sx: {
              fontSize: '1rem',
              padding: '8px',
              height: '3rem'
            }
          }}
        />

        <Paper
          elevation={4}
          sx={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '6px',
            p: 1.5,
            mb: 2
          }}
        >
          <Typography
            variant="h6"
            sx={{ textAlign: 'center', mb: 1, fontSize: '1.1rem', fontWeight: 600 }}
          >
            Product Categories
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
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

        {selectedCategory !== 'All' && subsOf(selectedCategory).length > 0 && (
          <Paper
            elevation={2}
            sx={{
              background: 'linear-gradient(135deg, #fafbfc 0%, #f5f6fa 100%)',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: '6px',
              p: 1.5,
              mb: 2
            }}
          >
            <SubcategoryTitle>
              Explore {selectedCategory.categoryName}
            </SubcategoryTitle>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
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

        <ProductsGrid>
          {filtered.length === 0 ? (
            <Typography 
              align="center" 
              sx={{ 
                gridColumn: '1/-1', 
                py: 4,
                fontSize: '1.1rem',
                color: 'text.secondary'
              }}
            >
              {isLoadingOverall ? 'Loading products...' : 'No products found.'}
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
                  sx={{ 
                    cursor: 'pointer',
                    width: '180px',
                    height: 'auto'
                  }}
                >
                  <ProductContainer product={p} />
                </Box>
              ))}
            </Suspense>
          )}
        </ProductsGrid>

        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} style={{ height: 1 }} />

        {/* Minor fetch status indicator */}
        {isFetchingNextPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </CenteredContainer>

      <Box component="footer" sx={{ mt: 'auto', py: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
        <Typography variant="body2">Contact: 0704288802</Typography>
        <Typography variant="body2">
          <a href="/terms-and-conditions">Terms & Conditions</a> |{' '}
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
                    src={modalProd.imageUrl || '/placeholder.jpg'}
                    alt={modalProd.name}
                    style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }}
                    onLoad={() => handleImageLoad(modalProd.id, modalProd.name)}
                    onError={() => handleImageError(modalProd.id, modalProd.name)}
                  />
                </Col>
                <Col xs={6}>
                  <Typography variant="h6">KSH {modalProd.price || 'N/A'}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => setModalProd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                    >
                      −
                    </Button>
                    <Typography sx={{ mx: 1 }}>{modalProd.quantity}</Typography>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setModalProd(p => ({ ...p, quantity: p.quantity + 1 }))}
                    >
                      +
                    </Button>
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

      <Backdrop open={isLoadingOverall} sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" size={50} />
      </Backdrop>
    </Box>
  );
}