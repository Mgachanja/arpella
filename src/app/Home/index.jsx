import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Nav from '../../components/Nav';
import '../../styles/boostrapCustom.css';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import ProductContainer from '../../components/ProductContainer';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Button } from '@mui/material';
import { products } from '../../demoData/products';
import Modal from 'react-bootstrap/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { addItemToCart, removeItemFromCart, updateItemQuantity } from '../../redux/slices/cartSlice';

function Index() {
  const [show, setShow] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalShow, setModalShow] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);

  const categories = Array.from(new Set(products.map(product => product.Category))).map(category => ({
    name: category,
    subCategories: Array.from(new Set(products.filter(product => product.Category === category).map(product => product.SubCategory))),
  }));

  const navigateToCart = () => {
    // Redirect to the cart page
    setModalShow(false);
    navigate('/cart');
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
    const productWithId = {
      ...modalProduct,
      id: modalProduct.id || uuidv4(),
    };
    dispatch(addItemToCart({ product: productWithId }));
  };

  const filterProductsByCategory = (category) => {
    setSelectedCategory(category);
    setFilteredProducts(
      category === 'All' ? products : products.filter((product) => product.Category === category)
    );
  };

  const displayedProducts = filteredProducts.length > 0 ? filteredProducts : products;

  return (
    <div>
      <Nav />
      {/* Offcanvas Button */}
      <button className="hide-large-screen d-flex align-items-start mt-3 ms-3 py-1" onClick={handleShow}>
        <MenuRoundedIcon />
      </button>

      <div className="container-fluid d-flex align-items-center hide justify-content-center py-2">
          <button
            className="btn hide category-btn me-2"
            onClick={() => filterProductsByCategory('All')}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.name}
              className="btn category-btn me-2"
              onClick={() => filterProductsByCategory(category.name)}
            >
              {category.name}
            </button>
          ))}
        </div>

      {/* Offcanvas with Accordion */}
      <Offcanvas show={show} onHide={handleClose} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Categories</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {categories.map((category, index) => (
            <Accordion key={index}>
              <AccordionSummary
                expandIcon={<MenuRoundedIcon />}
                aria-controls={`panel${index}-content`}
                id={`panel${index}-header`}
              >
                <Typography>{category.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {category.subCategories.map((subCategory, subIndex) => (
                  <Button
                    key={subIndex}
                    fullWidth
                    variant="text"
                    onClick={() => {
                      setSelectedCategory(subCategory);
                      setFilteredProducts(
                        products.filter((product) => product.SubCategory === subCategory)
                      );
                      handleClose(); 
                    }}
                  >
                    {subCategory}
                  </Button>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Product Listing */}
      <div className="container mt-4 pd-4">
        <h5 className="text-start mb-1">{selectedCategory === 'All' ? 'ALL PRODUCTS' : selectedCategory}</h5>
        <div className="row">
          {displayedProducts.map((product, index) => (
            <div className="col-6 col-md-3 col-lg-2 mb-1" key={index}>
              <div onClick={() => handleProductClick(product)}>
                <ProductContainer
                  key={index}
                  Name={product.Name}
                  Price={product.Price}
                  Image={product.Image}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <Modal
        show={modalShow}
        onHide={() => setModalShow(false)}
        centered
      >
        {modalProduct && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{modalProduct.Name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div style={{ flex: '1 1 50%', paddingRight: '20px' }}>
                  <img
                    src={modalProduct.Image}
                    alt={modalProduct.Name}
                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                  />
                </div>
                <div style={{ flex: '1 1 50%' }}>
                  <h5>Price: ${modalProduct.Price}</h5>
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
                      onClick={() => {
                        handleAddToCart();
                        setModalShow(false);
                      }}
                    >
                      Update Cart
                    </button>
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setModalShow(false)}>
                Close
              </Button>
              <Button variant="secondary" onClick={() => navigateToCart}>
                go to cart
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Index;
