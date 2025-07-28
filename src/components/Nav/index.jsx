import React from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { MdDeliveryDining } from 'react-icons/md';
import { Person } from '@mui/icons-material';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import { NavLink } from 'react-router-dom';

const NavBar = React.memo(() => {
  return (
    <Navbar
      bg="white"
      expand="lg"
      className="shadow-sm"
      style={{ position: 'sticky', top: 0, zIndex: 1030, padding: '0.75rem 1rem' }}
    >
      <Container fluid>
        <Navbar.Brand
          as={NavLink}
          to="/home"
          className="d-flex align-items-center"
          style={{ fontSize: '1.5rem', fontWeight: 600 }}
        >
          <MdDeliveryDining size={32} className="me-2 text-dark" />
          Arpella Stores
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />

        <Navbar.Collapse id="main-navbar" className="justify-content-end">
          <Nav className="align-items-center">
            <span
              role="img"
              aria-label="Kenya flag"
              style={{ fontSize: '1.75rem', marginRight: '1rem' }}
            >
              🇰🇪
            </span>

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

            <Nav.Link
              as={NavLink}
              to="/cart"
              className="p-0"
              style={{ textDecoration: 'none' }}
            >
              <Button
                variant="primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.5rem 1rem',
                  fontSize: '1rem',
                  borderRadius: '50px',
                }}
              >
                <ShoppingCartRoundedIcon fontSize="medium" className="me-2" />
                Cart
              </Button>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
});

export default NavBar;
