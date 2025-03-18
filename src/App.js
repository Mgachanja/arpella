import './App.css';
import React from 'react';
import Login from './app/login'
import Home from './app/Home'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Registration from './app/registration';
import Cart from './app/Cart';
function App() {
  return (
    <div className="App bg-custom">
       <Router>
        <div>
          <ToastContainer />
          <Routes>
            <Route path="/" element={<Registration />} /> {/* Default route */}
            <Route path="/login" element={<Login />} />  {/* Login route */}

            <Route path ="/home" element={<Home/>}/> {/*landing page*/}
            <Route path='/cart' element={<Cart/>}/> {/*cart page*/}
          </Routes>
        </div>
       </Router>
    </div>
  );
}

export default App;
