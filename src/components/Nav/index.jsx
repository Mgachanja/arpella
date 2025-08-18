// src/components/Nav.js
import React, { useState, useMemo, useCallback } from 'react';
import { Navbar, Container, Nav, Button, Badge, Offcanvas } from 'react-bootstrap';
import { MdDeliveryDining } from 'react-icons/md';
import { Person } from '@mui/icons-material';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Responsive NavBar
 * - Desktop (>= lg): original design; Profile & Cart buttons visible inline
 * - Mobile (< lg): Profile & Cart are hidden; hamburger toggles an Offcanvas that contains them
 * - Buttons visibility handled exclusively by the hamburger on small screens
 */

const NavBar = React.memo(function NavBar() {
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  // Read cart items and compute count efficiently
  const cartItems = useSelector((s) => s.cart?.items || {});
  const cartArray = Array.isArray(cartItems) ? cartItems : Object.values(cartItems || {});
  const cartCount = useMemo(
    () => cartArray.reduce((acc, it) => acc + (Number(it?.quantity) || 1), 0),
    [cartArray]
  );

  const authUser = useSelector((s) => s.auth?.user);

  const handleToggle = useCallback(() => setShowOffcanvas((v) => !v), []);
  const handleClose = useCallback(() => setShowOffcanvas(false), []);

  return (
    <>
      <Navbar
        bg="white"
        expand="lg"
        className="shadow-sm"
        style={{ position: 'sticky', top: 0, zIndex: 1030, padding: '0.75rem 1rem' }}
      >
        <Container fluid>
          {/* Brand */}
          <Navbar.Brand
            as={NavLink}
            to="/home"
            className="d-flex align-items-center"
            style={{ fontSize: '1.5rem', fontWeight: 600 }}
          >
            <MdDeliveryDining size={32} className="me-2 text-dark" />
            Arpella Stores
          </Navbar.Brand>

          {/* Toggle (visible only on small screens) - it opens Offcanvas */}
          <Navbar.Toggle
            aria-controls="main-navbar"
            onClick={handleToggle}
            aria-expanded={showOffcanvas}
            aria-label="Toggle navigation"
          />

          {/* Desktop inline content (visible >= lg) */}
          <Navbar.Collapse id="main-navbar" className="justify-content-end">
            <Nav className="align-items-center">
              <span
                role="img"
                aria-label="Kenya flag"
                style={{ fontSize: '1.75rem', marginRight: '1rem' }}
              >
                🇰🇪
              </span>

              {/* Desktop Profile button */}
              <div className="d-none d-lg-block">
                <Nav.Link
                  as={NavLink}
                  to="/profile"
                  className="me-3 p-0"
                  style={{ textDecoration: 'none' }}
                >
                  <Button
                    variant="outline-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.5rem 1rem',
                      fontSize: '1rem',
                      borderRadius: '50px',
                    }}
                  >
                    <Person fontSize="medium" className="me-2" />
                    Profile
                  </Button>
                </Nav.Link>
              </div>

              {/* Desktop Cart button */}
              <div className="d-none d-lg-block">
                <Nav.Link as={NavLink} to="/cart" className="p-0" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.5rem 1rem',
                      fontSize: '1rem',
                      borderRadius: '50px',
                      position: 'relative',
                    }}
                  >
                    <ShoppingCartRoundedIcon fontSize="medium" className="me-2" />
                    Cart
                    {cartCount > 0 && (
                      <Badge
                        bg="danger"
                        pill
                        style={{ marginLeft: 8, fontSize: '0.75rem', lineHeight: '1', padding: '0.25rem 0.45rem' }}
                      >
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </Nav.Link>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Offcanvas (mobile) - contains the Profile & Cart buttons and other quick links */}
      <Offcanvas show={showOffcanvas} onHide={handleClose} placement="end" aria-labelledby="mobile-nav-label">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title id="mobile-nav-label">Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <nav aria-label="Mobile primary">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 12 }}>
                <span role="img" aria-label="Kenya flag" style={{ fontSize: 20, marginRight: 8 }}>
                  🇰🇪
                </span>
                <span style={{ verticalAlign: 'middle', color: '#555' }}>Kenya</span>
              </li>

              <li style={{ marginBottom: 12 }}>
                <Nav.Link
                  as={NavLink}
                  to="/profile"
                  onClick={handleClose}
                  style={{ textDecoration: 'none', color: 'inherit', padding: 0 }}
                >
                  <Button
                    variant="outline-primary"
                    className="w-100 d-flex align-items-center"
                    style={{ justifyContent: 'flex-start', gap: 12 }}
                    aria-label="Go to profile"
                  >
                    <Person fontSize="medium" />
                    <span style={{ fontWeight: 600 }}>
                      {authUser ? (authUser.firstName || authUser.username) : 'Profile'}
                    </span>
                  </Button>
                </Nav.Link>
              </li>

              <li style={{ marginBottom: 12 }}>
                <Nav.Link
                  as={NavLink}
                  to="/cart"
                  onClick={handleClose}
                  style={{ textDecoration: 'none', color: 'inherit', padding: 0 }}
                >
                  <Button
                    variant="primary"
                    className="w-100 d-flex align-items-center"
                    style={{ justifyContent: 'flex-start', gap: 12, position: 'relative' }}
                    aria-label="View cart"
                  >
                    <ShoppingCartRoundedIcon fontSize="medium" />
                    <span style={{ fontWeight: 600 }}>Cart</span>
                    {cartCount > 0 && (
                      <Badge
                        bg="danger"
                        pill
                        style={{ position: 'absolute', right: 12, fontSize: '0.75rem', padding: '0.25rem 0.4rem' }}
                      >
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </Nav.Link>
              </li>
            </ul>
          </nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
});

export default NavBar;
