import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { MdDeliveryDining, } from "react-icons/md";
import { Person } from '@mui/icons-material';
import '../../styles/boostrapCustom.css'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';

function index() {
  return (
    <div>
        <nav className="container-fluid d-flex align-items-center justify-content-start border-bottom border-dark py-2">
        <div className="container-fluid d-flex align-items-center pt-1 pb-1 ps-3">
            <MdDeliveryDining size={25} color="black" className="me-2" />
            <Link className="navbar-brand ms-2" href="#">
             Arpella Stores
            </Link>
        </div>
        <div className="container-fluid d-flex align-items-center justify-content-end">
            <button className="btn custom-btn me-3">
                <Person/>
                Profile</button>
            <button className="btn custom-btn me-3">
                <ShoppingCartRoundedIcon/>
                Cart</button>
        </div>
            
            {/*<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                <li className="nav-item">
                    <Link className="nav-link active" aria-current="page" href="#">Home</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" href="#">Features</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" href="#">Pricing</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Disabled</Link>
                </li>
                </ul>
            </div>
           
            </div>
             */}
        </nav>
    </div>
  )
}

export default index