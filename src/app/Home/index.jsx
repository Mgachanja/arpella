// src/pages/ProductIndex.js
import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsAndRelated, setProducts, fetchProductsApi } from '../../redux/slices/productsSlice';
import NavBar from '../../components/Nav';
import ProductContainer from '../../components/ProductContainer';
import OffersSection from '../../components/OffersSection';
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
  Button as MuiButton,
  Alert,
  IconButton
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { styled } from '@mui/system';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Row, Col, Offcanvas, Accordion, ListGroup } from 'react-bootstrap';
import { useInfiniteQuery } from '@tanstack/react-query';

const CenteredContainer = styled(Box)(({ theme }) => ({
  maxWidth: '1400px',
  width: '100%',
  margin: '0 auto',
  paddingLeft: '24px',
  paddingRight: '24px',
  paddingTop: '24px',
  paddingBottom: '48px',
  boxSizing: 'border-box',
  [theme.breakpoints.down('sm')]: {
    paddingLeft: '16px',
    paddingRight: '16px'
  }
}));

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #c85d00 0%, #492301ff 100%)',
  color: 'white',
  padding: '80px 20px',
  textAlign: 'center',
  borderRadius: '0 0 40px 40px',
  marginBottom: '40px',
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

const SearchContainer = styled(Box)(({ theme }) => ({
  maxWidth: '600px',
  margin: '30px auto 0',
  position: 'relative',
  zIndex: 1
}));

const CategoryPill = styled(MuiButton)(({ isSelected }) => ({
  borderRadius: '50px',
  padding: '8px 24px',
  margin: '4px',
  whiteSpace: 'nowrap',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  transition: 'all 0.2s ease',
  backgroundColor: (isSelected ? 'rgba(200, 93, 0, 0.04)' : '#fff') + ' !important',
  color: (isSelected ? '#0057c8ff' : '#4b5563') + ' !important',
  border: '1.5px solid !important',
  borderColor: (isSelected ? '#002fc8ff' : '#e5e7eb') + ' !important',
  boxShadow: 'none',
  minHeight: '40px',
  '&:hover': {
    backgroundColor: 'rgba(200, 93, 0, 0.08) !important',
    borderColor: '#002fc8ff !important',
    color: '#002fc8ff !important',
    transform: 'translateY(-2px)'
  }
}));

const SubcategoryButton = styled(MuiButton)(({ isSelected }) => ({
  fontWeight: 600,
  fontSize: '0.85rem',
  textTransform: 'none',
  padding: '6px 16px',
  margin: '4px',
  borderRadius: '50px',
  backgroundColor: (isSelected ? 'rgba(200, 93, 0, 0.04)' : 'transparent') + ' !important',
  color: (isSelected ? '#c85d00' : '#4b5563') + ' !important',
  minHeight: '36px',
  border: '1px solid !important',
  borderColor: (isSelected ? '#c85d00' : '#e5e7eb') + ' !important',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(200, 93, 0, 0.08) !important',
    borderColor: '#c85d00 !important',
    color: '#c85d00 !important',
    transform: 'translateY(-1px)'
  }
}));

const SubcategoryTitle = styled(Typography)({
  fontSize: '1.25rem',
  fontWeight: 700,
  color: '#1f2937',
  textAlign: 'center',
  marginBottom: '20px',
  position: 'relative'
});

const ProductsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  width: '100%',
  gap: '24px',
  marginTop: '32px',
  justifyContent: 'flex-start',
  gridTemplateColumns: 'repeat(auto-fill, 180px)',
  
  [theme.breakpoints.down('sm')]: {
    gap: '16px',
    gridTemplateColumns: 'repeat(auto-fill, 160px)'
  }
}));

export default function ProductIndex() {
  const dispatch = useDispatch();
  const { products = [], categories = [], subcategories = [], loading, error } = useSelector(s => s.products || {});
  const cart = useSelector(s => s.cart.items);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSub, setSelectedSub] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalProd, setModalProd] = useState(null);

  // NEW: Offcanvas menu state for small screens only
  const [showMenuOff, setShowMenuOff] = useState(false);

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
      list = list.filter(p => String(p.category) === String(selectedCategory.id ?? selectedCategory));
    }
    if (selectedSub) {
      list = list.filter(p => String(p.subcategory) === String(selectedSub.id));
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
    (subcategories || []).filter(sc => String(sc.categoryId) === String(cat.id));

  // Add product to cart from modal
  const onAdd = () => {
    const id = modalProd.id || uuidv4();
    const orig = Number(modalProd.price) || 0;
    const offer = Number(modalProd.priceAfterDiscount) || 0;
    const cartPrice = offer > 0 ? offer : orig;
    dispatch(addItemToCart({ 
      product: { 
        id, 
        quantity: modalProd.quantity,
        name: modalProd.name,
        price: cartPrice,
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

      <HeroSection>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
          Everything you need, delivered.
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, fontWeight: 400 }}>
          Search through thousands of products from your favorite stores.
        </Typography>
        <SearchContainer>
          <TextField
            fullWidth
            placeholder="Search products, categories, brands..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            variant="outlined"
            InputProps={{
              sx: {
                fontSize: '1.1rem',
                padding: '12px 20px',
                height: '4rem',
                backgroundColor: '#fff',
                borderRadius: '50px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                '& fieldset': { border: 'none' }
              }
            }}
          />
        </SearchContainer>
      </HeroSection>

      <CenteredContainer>
        {/* Mobile menu toggle */}
        <Box sx={{ display: { xs: 'flex', lg: 'none' }, alignItems: 'center', gap: 1, mb: 3 }}>
          <IconButton aria-label="menu" onClick={() => setShowMenuOff(true)} sx={{ bgcolor: 'rgba(25, 118, 210, 0.08)' }}>
            <MenuIcon color="primary" />
          </IconButton>
          <Typography sx={{ fontWeight: 600, color: '#4b5563' }}>Explore Categories</Typography>
        </Box>

        <Box
          sx={{
            p: 1,
            mb: 4,
            display: { xs: 'none', lg: 'block' }
          }}
        >
          <Typography
            variant="h5"
            sx={{ textAlign: 'left', mb: 3, fontWeight: 700, color: '#1f2937' }}
          >
            Popular Categories
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
            <CategoryPill
              isSelected={selectedCategory === 'All'}
              onClick={() => { setSelectedCategory('All'); setSelectedSub(null); }}
            >
              All Products
            </CategoryPill>
            {categories.map(cat => (
              <CategoryPill
                key={cat.id}
                isSelected={String(selectedCategory?.id ?? selectedCategory) === String(cat.id)}
                onClick={() => { setSelectedCategory(cat); setSelectedSub(null); }}
              >
                {cat.categoryName}
              </CategoryPill>
            ))}
          </Box>
        </Box>

        {/* SUBCATEGORIES: VISIBLE ONLY ON LARGE SCREENS (hidden on mobile) */}
        {selectedCategory !== 'All' && subsOf(selectedCategory).length > 0 && (
          <Box
            sx={{
              p: 1,
              mb: 4,
              display: { xs: 'none', lg: 'block' }
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
          </Box>
        )}

        <Box sx={{ maxWidth: '1200px', width: '100%', mx: 'auto' }}>
          <OffersSection onSelect={(product) => {
            const ic = cart[product.id];
            setModalProd({ ...product, quantity: ic ? ic.quantity : 1 });
            setShowModal(true);
          }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
            <Box sx={{ flex: 1, height: '1px', bgcolor: '#e5e7eb' }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
              All Products
            </Typography>
            <Box sx={{ flex: 1, height: '1px', bgcolor: '#e5e7eb' }} />
          </Box>

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
        </Box>

      </CenteredContainer>

      <Box 
        component="footer" 
        sx={{ 
          mt: 'auto', 
          py: 6, 
          textAlign: 'center', 
          bgcolor: '#fff', 
          borderTop: '1px solid #e5e7eb' 
        }}
      >
        <CenteredContainer sx={{ py: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
            Arpella Stores
          </Typography>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
            <a href="/terms-and-conditions" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: 500 }}>Terms & Conditions</a>
            <a href="/privacy-policy" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: 500 }}>Privacy Policy</a>
            <a href="/delivery-terms" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: 500 }}>Delivery Terms</a>
          </Box>
          <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>Contact: 0704288802</Typography>
          <Typography variant="caption" sx={{ color: '#9ca3af' }}>© {new Date().getFullYear()} Arpella Stores. All rights reserved.</Typography>
        </CenteredContainer>
      </Box>

      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        centered
        contentClassName="border-0 shadow-lg"
        style={{ borderRadius: '24px' }}
      >
        {modalProd && (
          <Box sx={{ p: 1 }}>
            <Modal.Header closeButton className="border-0 pb-0">
              <Modal.Title sx={{ fontWeight: 800, color: '#111827' }}>{modalProd.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-2">
              <Row className="align-items-center">
                <Col md={6} className="mb-3 mb-md-0">
                  <Box
                    sx={{
                      width: '100%',
                      height: '240px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      bgcolor: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <img
                      src={modalProd.imageUrl || '/placeholder.jpg'}
                      alt={modalProd.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onLoad={() => handleImageLoad(modalProd.id, modalProd.name)}
                      onError={() => handleImageError(modalProd.id, modalProd.name)}
                    />
                  </Box>
                </Col>
                <Col md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                      Price
                    </Typography>
                    {(() => {
                      const orig = Number(modalProd.price) || 0;
                      const offer = Number(modalProd.priceAfterDiscount) || 0;
                      const hasOffer = offer > 0;
                      const pct = hasOffer && orig > 0
                        ? Math.round(((orig - offer) / orig) * 100)
                        : 0;
                      return (
                        <>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#c85d00' }}>
                              KSH {(hasOffer ? offer : orig).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </Typography>
                            {hasOffer && (
                              <Box
                                sx={{
                                  bgcolor: '#c85d00',
                                  color: '#fff',
                                  fontWeight: 700,
                                  fontSize: '0.75rem',
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: '50px',
                                }}
                              >
                                {pct}% OFF
                              </Box>
                            )}
                          </Box>
                          {hasOffer && (
                            <Typography sx={{ color: '#9ca3af', textDecoration: 'line-through', fontSize: '0.95rem', mt: 0.25 }}>
                              KSH {orig.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </Typography>
                          )}
                        </>
                      );
                    })()}
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', mb: 1, display: 'block' }}>
                      Select Quantity
                    </Typography>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        bgcolor: '#f9fafb',
                        p: 1,
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <IconButton
                        onClick={() => setModalProd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                        sx={{ bgcolor: '#fff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', '&:hover': { bgcolor: '#f3f4f6' } }}
                        size="small"
                      >
                        <span style={{ fontSize: '1.5rem', lineHeight: '1', fontWeight: 400 }}>−</span>
                      </IconButton>
                      <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#111827' }}>
                        {modalProd.quantity}
                      </Typography>
                      <IconButton
                        onClick={() => setModalProd(p => ({ ...p, quantity: p.quantity + 1 }))}
                        sx={{ bgcolor: '#fff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', '&:hover': { bgcolor: '#f3f4f6' } }}
                        size="small"
                      >
                        <span style={{ fontSize: '1.5rem', lineHeight: '1', fontWeight: 400 }}>+</span>
                      </IconButton>
                    </Box>
                  </Box>

                  <Button 
                    variant="primary" 
                    className="w-100 py-3 rounded-pill fw-bold shadow-sm"
                    style={{ fontSize: '1.1rem' }}
                    onClick={onAdd}
                  >
                    Update Cart
                  </Button>
                </Col>
              </Row>
            </Modal.Body>
          </Box>
        )}
      </Modal>

      {/* Offcanvas for hamburger menu (small screens only) */}
      <Offcanvas show={showMenuOff} onHide={() => setShowMenuOff(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Categories</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {(categories || []).length === 0 ? (
            <div className="text-center text-muted">No categories available</div>
          ) : (
            <Accordion defaultActiveKey={null}>
              {categories.map(cat => (
                <Accordion.Item eventKey={String(cat.id)} key={cat.id}>
                  <Accordion.Header>{cat.categoryName || 'Unnamed Category'}</Accordion.Header>
                  <Accordion.Body>
                    {subsOf(cat).length === 0 ? (
                      <div className="ms-2 text-muted">No subcategories</div>
                    ) : (
                      <ListGroup variant="flush">
                        {subsOf(cat).map(sub => (
                          <ListGroup.Item
                            key={sub.id}
                            action
                            onClick={() => {
                              setSelectedCategory(cat);
                              setSelectedSub(sub);
                              setShowMenuOff(false);
                              window.scrollTo({ top: 200, behavior: 'smooth' });
                            }}
                          >
                            {sub.subcategoryName || sub.name || 'Unnamed Subcategory'}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      <Backdrop open={isLoadingOverall} sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" size={50} />
      </Backdrop>
    </Box>
  );
}
