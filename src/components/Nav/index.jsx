import React from 'react';
import { useSelector } from 'react-redux'; // Import useSelector
import { Link } from 'react-router-dom';
import { MdDeliveryDining } from "react-icons/md";
import { Person } from '@mui/icons-material';
import '../../styles/boostrapCustom.css';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import { useNavigate } from 'react-router-dom';


function Index() {
  const cart = useSelector((state) => state.cart.items);
const navigate = useNavigate();
  const handleCartClick = () => {
    navigate('/cart');
    if (Object.keys(cart).length === 0) {
      console.log("The cart is empty.");
    } else {
      console.log("Cart Items:", cart);
    }
  };

  const fetchDemoData = async () => {
    try {
      const response = await fetch('https:arpellastoresapi.azurewebsites.net/categories');
      const data = await response.json();
      console.log("Demo data:", data);
    } catch (error) {
      console.error("Error fetching demo data:", error);
    }
  }
  

  return (
    <div>
      <nav className="container-fluid d-flex align-items-center justify-content-start border-bottom border-dark py-2">
        <div className="container-fluid d-flex align-items-center pt-1 pb-1 ps-3">
          <MdDeliveryDining size={25} color="black" className="me-2" />
          <Link className="navbar-brand ms-2" to="/home">
            Arpella Stores
          </Link>
        </div>
        <div className="container-fluid d-flex align-items-center justify-content-end">
          <button className="btn custom-btn me-3" onClick={fetchDemoData}>
            <Person />
            <span className="hide">profile</span>
          </button>
          {/* Cart button, logs the items when clicked */}
          <button className="btn custom-btn me-3" onClick={handleCartClick}>
            <ShoppingCartRoundedIcon />
            <span className="hide">cart</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default Index;
