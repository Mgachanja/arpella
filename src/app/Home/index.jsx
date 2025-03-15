import React, { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import Nav from '../../components/Nav';
import '../../styles/boostrapCustom.css';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Accordion, AccordionSummary, AccordionDetails, Typography, CircularProgress, Button as MUIButton } from '@mui/material';
import Modal from 'react-bootstrap/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { addItemToCart } from '../../redux/slices/cartSlice';
import { fetchProducts } from '../../redux/slices/productsSlice';
import successToast from '../UserNotifications/successToast';
import errorToast from '../UserNotifications/errorToast';
import infoToast from '../UserNotifications/infoToast';

const baseUrl = process.env.REACT_APP_BASE_API_URL;

// Lazy load the ProductContainer component (ensure it accepts a full product object)
const loadProductContainer = () => import('../../components/ProductContainer');
const ProductContainer = React.lazy(loadProductContainer);

function Index() {
  const [show, setShow] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);
  const productsState = useSelector((state) => state.products);
  const { products, loading, error } = productsState;

  useEffect(() => {
    dispatch(fetchProducts());
    // Fetch categories using axios without extra headers
    const fetchCategoriesFn = async () => {
      try {
        console.log("Fetching categories from:", `${baseUrl}/categories`);
        const response = await axios.get(`${baseUrl}/categories`, {
          headers: { "Content-Type": "application/json" }});
        console.log("Categories fetched:", response.data);
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          setCategories([]);
          errorToast('Invalid categories format');
        }
      } catch (err) {
        console.error('Error fetching categories:', err.response?.data || err.message);
        errorToast('Error fetching categories');
      }
    };
    fetchCategoriesFn();
    setSelectedCategory('All');
    setSelectedSubcategory(null);
  }, [dispatch]);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const handleCategoryClick = (cat) => {
    setSearchTerm('');
    setSelectedSubcategory(null);
    if (cat === 'All') {
      setFilteredProducts(products);
      setSelectedCategory('All');
    } else {
      setSelectedCategory(cat);
      const filtered = products.filter(product => product.category === cat.id);
      setFilteredProducts(filtered);
    }
  };

  const handleSubcategoryClick = (subCat) => {
    setSearchTerm('');
    setSelectedSubcategory(subCat);
    if (selectedCategory !== 'All') {
      const filtered = products.filter(
        product =>
          product.category === selectedCategory.id &&
          product.subcategory === subCat.id
      );
      setFilteredProducts(filtered);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    let productsToSearch = products;
    if (selectedCategory !== 'All') {
      productsToSearch = productsToSearch.filter(product => product.category === selectedCategory.id);
    }
    if (selectedSubcategory) {
      productsToSearch = productsToSearch.filter(product => product.subcategory === selectedSubcategory.id);
    }
    if (term.trim() !== '') {
      productsToSearch = productsToSearch.filter(product =>
        product.name.toLowerCase().includes(term.toLowerCase())
      );
    }
    setFilteredProducts(productsToSearch);
  };

  const handleProductClick = (product) => {
    const cartItem = cart[product.id];
    setModalProduct({
      ...product,
      quantity: cartItem ? cartItem.quantity : 1,
    });
    setModalShow(true);
  };

  const handleAddToCart = () => {
    if (!modalProduct) return;
    const productWithId = { ...modalProduct, id: modalProduct.id || uuidv4() };
    dispatch(addItemToCart({ product: { id: productWithId.id, quantity: productWithId.quantity } }));
    successToast('Product added to cart successfully!');
    setModalShow(false);
  };

  const getCategoryName = (cat) => {
    if (!cat) return '';
    return cat.categoryName || (typeof cat.category === 'string' ? cat.category : '');
  };

  return (
    <div>
      <Nav />
      {/* Search Input */}
      <div className="container mt-3">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearch}
          className="form-control"
        />
      </div>
      {/* Mobile Toggle Button */}
      <div className="container mt-3 d-lg-none">
        <MUIButton color="inherit" onClick={() => setShow(true)} startIcon={<MenuRoundedIcon />}>
          Categories
        </MUIButton>
      </div>
      {/* Desktop Categories Navigation */}
      <div className="container-fluid d-none d-lg-flex align-items-center justify-content-center py-2">
        <button className="btn category-btn me-2" onClick={() => handleCategoryClick('All')}>
          All
        </button>
        {categories.map((cat) => (
          <button key={cat.id} className="btn category-btn me-2" onClick={() => handleCategoryClick(cat)}>
            {getCategoryName(cat)}
          </button>
        ))}
      </div>
      {/* Mobile Side Nav using MUI Drawer */}
      <Drawer anchor="left" open={show} onClose={() => setShow(false)}>
        <div style={{ width: 250, padding: '10px' }}>
          <Typography variant="h6" gutterBottom>
            Categories
          </Typography>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => { handleCategoryClick('All'); setShow(false); }}>
                <ListItemText primary="All" />
              </ListItemButton>
            </ListItem>
            {categories.map((cat) =>
              cat.subcategories && cat.subcategories.length > 0 ? (
                <Accordion key={cat.id} TransitionProps={{ unmountOnExit: true }}>
                  <AccordionSummary>
                    <Typography>{getCategoryName(cat)}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {cat.subcategories.map((subCat, idx) => (
                        <ListItem key={idx} disablePadding>
                          <ListItemButton onClick={() => { handleSubcategoryClick(subCat); setShow(false); }}>
                            <ListItemText primary={typeof subCat === 'string' ? subCat : subCat.subcategoryName || 'Unknown'} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ) : (
                <ListItem key={cat.id} disablePadding>
                  <ListItemButton onClick={() => { handleCategoryClick(cat); setShow(false); }}>
                    <ListItemText primary={getCategoryName(cat)} />
                  </ListItemButton>
                </ListItem>
              )
            )}
          </List>
        </div>
      </Drawer>
      {/* Desktop Subcategories Navigation */}
      {selectedCategory !== 'All' && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
        <div className="container-fluid d-flex align-items-center justify-content-center py-2">
          {selectedCategory.subcategories.map((subCat, idx) => (
            <button key={idx} className="btn category-btn me-2" onClick={() => handleSubcategoryClick(subCat)}>
              {typeof subCat === 'string' ? subCat : subCat.subcategoryName || 'Unknown'}
            </button>
          ))}
        </div>
      )}
      {/* Products Listing */}
      <div className="container mt-4 pd-4">
        <h5 className="text-start mb-1">
          {selectedCategory === 'All' ? 'ALL PRODUCTS' : getCategoryName(selectedCategory)}
          {selectedSubcategory ? ` - ${typeof selectedSubcategory === 'string' ? selectedSubcategory : selectedSubcategory.subcategoryName}` : ''}
        </h5>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', width: '100%' }}>
            <CircularProgress />
          </div>
        ) : (
          <div className="row">
            <Suspense fallback={
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', width: '100%' }}>
                <CircularProgress />
              </div>
            }>
              {filteredProducts.map((product) => (
                <div className="col-6 col-md-3 col-lg-2 mb-1" key={product.id}>
                  <div onClick={() => handleProductClick(product)}>
                    <ProductContainer product={product} />
                  </div>
                </div>
              ))}
            </Suspense>
          </div>
        )}
      </div>
      {/* Modal for Product Details */}
      <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
        {modalProduct && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{modalProduct.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div style={{ flex: '1 1 50%', paddingRight: '20px' }}>
                  <img
                    src={
                      modalProduct.productimages && modalProduct.productimages.length > 0
                        ? modalProduct.productimages[0].imageUrl
                        : 'placeholder.jpg'
                    }
                    alt={modalProduct.name}
                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                    loading="lazy"
                  />
                </div>
                <div style={{ flex: '1 1 50%' }}>
                  <h5>Price: KSH {modalProduct.price}</h5>
                  <div className="mt-3">
                    <div className="d-flex align-items-center">
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() =>
                          setModalProduct((prev) => ({
                            ...prev,
                            quantity: Math.max(1, prev.quantity - 1),
                          }))
                        }
                      >
                        -
                      </button>
                      <span>{modalProduct.quantity}</span>
                      <button
                        className="btn btn-sm btn-primary ms-2"
                        onClick={() =>
                          setModalProduct((prev) => ({
                            ...prev,
                            quantity: prev.quantity + 1,
                          }))
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="btn btn-primary mt-3 w-100"
                      onClick={handleAddToCart}
                    >
                      Update Cart
                    </button>
                  </div>
                </div>
              </div>
            </Modal.Body>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Index;
