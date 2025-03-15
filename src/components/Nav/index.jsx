import React from 'react';
import { MdDeliveryDining } from "react-icons/md";
import { Person } from '@mui/icons-material';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import { useNavigate } from 'react-router-dom';
import '../../styles/boostrapCustom.css';
import { Link } from 'react-router-dom';

function NavBar() {

  return (
    <nav className="container-fluid d-flex align-items-center justify-content-between border-bottom border-dark py-2">
      <div className="d-flex align-items-center">
        <MdDeliveryDining size={25} color="black" className="me-2" />
        <Link className="navbar-brand ms-2" to="/home">
          Arpella Stores
        </Link>
      </div>
      <div className="d-flex align-items-center">
        <Link to="/profile" className="btn custom-btn me-3">
          <Person />
          <span className="hide">Profile</span>
        </Link>
        <Link to="/cart" >
        <button className="btn custom-btn me-3">
          <ShoppingCartRoundedIcon />
          <span className="hide">Cart</span>
        </button>
        </Link>
      </div>
    </nav>
  );
}

export default NavBar;
