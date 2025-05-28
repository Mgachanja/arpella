import React, { useState, useEffect, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsAndRelated } from '../../redux/slices/productsSlice';
import Nav from '../../components/Nav';
import ProductContainer from '../../components/ProductContainer';
import successToast from '../UserNotifications/successToast';
import { addItemToCart } from '../../redux/slices/cartSlice';
import { v4 as uuidv4 } from 'uuid';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  CircularProgress,
  Button as MUIButton,
  Box,
  Backdrop
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Row, Col } from 'react-bootstrap';

function Index() {
  const dispatch = useDispatch();
  const { products, categories, subcategories, loading, error } = useSelector(state => state.products);
  const cart = useSelector(state => state.cart.items);

  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);

  // Kick off the thunk once
  useEffect(() => {
    dispatch(fetchProductsAndRelated());
  }, [dispatch]);

  // When products load or filter criteria change, recompute
  useEffect(() => {
    let list = products;

    if (selectedCategory !== 'All') {
      list = list.filter(p => p.category === selectedCategory.id);
    }
    if (selectedSubcategory) {
      list = list.filter(p => p.subcategory === selectedSubcategory.id);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(term));
    }
    setFilteredProducts(list);
  }, [products, selectedCategory, selectedSubcategory, searchTerm]);

  const handleCategoryClick = cat => {
    setSearchTerm('');
    setSelectedSubcategory(null);
    setSelectedCategory(cat === 'All' ? 'All' : cat);
  };

  const handleSubcategoryClick = sub => {
    setSearchTerm('');
    setSelectedSubcategory(sub);
  };

  const handleSearch = e => setSearchTerm(e.target.value);

  const handleProductClick = product => {
    const inCart = cart[product.id];
    setModalProduct({ ...product, quantity: inCart ? inCart.quantity : 1 });
    setModalShow(true);
  };

  const handleAddToCart = () => {
    if (!modalProduct) return;
    const id = modalProduct.id || uuidv4();
    dispatch(addItemToCart({ product: { id, quantity: modalProduct.quantity } }));
    successToast('Product added to cart successfully!');
    setModalShow(false);
  };

  const closeModal = () => setModalShow(false);

  // Helper to get subcats of a category
  const getSubcats = cat =>
    subcategories.filter(sc => sc.category === cat.id);

  return (
    <div>
      <Nav />

      {/* Search bar */}
      <div className="container mt-3">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearch}
          className="form-control"
        />
      </div>

      {/* Category button for mobile */}
      <div className="container mt-3 d-lg-none">
        <MUIButton
          color="inherit"
          onClick={() => setShowDrawer(true)}
          startIcon={<MenuRoundedIcon />}
        >
          Categories
        </MUIButton>
      </div>

      {/* Category buttons for desktop */}
      <div className="container-fluid d-none d-lg-flex align-items-center justify-content-center py-2">
        <button
          className="btn category-btn me-2"
          onClick={() => handleCategoryClick('All')}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className="btn category-btn me-2"
            onClick={() => handleCategoryClick(cat)}
          >
            {cat.categoryName}
          </button>
        ))}
      </div>

      {/* Drawer for mobile categories */}
      <Drawer
        anchor="left"
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Categories
          </Typography>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  handleCategoryClick('All');
                  setShowDrawer(false);
                }}
              >
                <ListItemText primary="All" />
              </ListItemButton>
            </ListItem>
            {categories.map(cat => (
              <Accordion key={cat.id} TransitionProps={{ unmountOnExit: true }}>
                <AccordionSummary>
                  <Typography>{cat.categoryName}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {getSubcats(cat).map(sub => (
                      <ListItem key={sub.id} disablePadding>
                        <ListItemButton
                          onClick={() => {
                            handleSubcategoryClick(sub);
                            setShowDrawer(false);
                          }}
                        >
                          <ListItemText primary={sub.subcategoryName} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Subcategory buttons under desktop when a category is selected */}
      {selectedCategory !== 'All' && getSubcats(selectedCategory).length > 0 && (
        <div className="container-fluid d-flex align-items-center justify-content-center py-2">
          {getSubcats(selectedCategory).map(sub => (
            <button
              key={sub.id}
              className="btn category-btn me-2"
              onClick={() => handleSubcategoryClick(sub)}
            >
              {sub.subcategoryName}
            </button>
          ))}
        </div>
      )}

      {/* Product grid */}
      <div className="container mt-4 pd-4">
        <h5 className="text-start mb-1">
          {selectedCategory === 'All'
            ? 'ALL PRODUCTS'
            : selectedCategory.categoryName}
          {selectedSubcategory
            ? ` - ${selectedSubcategory.subcategoryName}`
            : ''}
        </h5>

        {filteredProducts.length === 0 ? (
          <p className="text-center">No products found.</p>
        ) : (
          <div className="row">
            <Suspense
              fallback={
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '200px',
                    width: '100%'
                  }}
                >
                  <CircularProgress />
                </div>
              }
            >
              {filteredProducts.map(product => (
                <div
                  className="col-6 col-md-3 col-lg-2 mb-1"
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                >
                  <ProductContainer product={product} />
                </div>
              ))}
            </Suspense>
          </div>
        )}
      </div>

      {/* Add‑to‑Cart Modal */}
      <Modal show={modalShow} onHide={closeModal} centered>
        {modalProduct && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{modalProduct.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col xs={6}>
                  <img
                    src={
                      modalProduct.productimages?.[0]?.imageUrl ||
                      'placeholder.jpg'
                    }
                    alt={modalProduct.name}
                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                    loading="lazy"
                  />
                </Col>
                <Col xs={6}>
                  <h5>Price: KSH {modalProduct.price}</h5>
                  <div className="d-flex align-items-center mt-3">
                    <Button
                      variant="primary"
                      size="sm"
                      className="me-2"
                      onClick={() =>
                        setModalProduct(prev => ({
                          ...prev,
                          quantity: Math.max(1, prev.quantity - 1)
                        }))
                      }
                    >
                      -
                    </Button>
                    <span>{modalProduct.quantity}</span>
                    <Button
                      variant="primary"
                      size="sm"
                      className="ms-2"
                      onClick={() =>
                        setModalProduct(prev => ({
                          ...prev,
                          quantity: prev.quantity + 1
                        }))
                      }
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    variant="primary"
                    className="mt-3 w-100"
                    onClick={handleAddToCart}
                  >
                    Update Cart
                  </Button>
                </Col>
              </Row>
            </Modal.Body>
          </>
        )}
      </Modal>

      {/* Global loading backdrop */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: theme => theme.zIndex.drawer + 1,
          flexDirection: 'column'
        }}
        open={loading}
      >
        <CircularProgress color="inherit" size={60} />
      </Backdrop>
    </div>
  );
}

export default Index;
