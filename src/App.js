import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store";
import Login from "./app/login";
import Home from "./app/Home";
import Registration from "./app/registration";
import Cart from "./app/Cart";
import Profile from "./app/profile";
import ControlPanel from "./app/controlPanel";
import Package from "./app/profile/Package";
import ProtectedRoute from "./app/ProtectedRoute"
import Terms from "./app/Terms"
import Privacy from "./app/Privacy"
import DeliveryTermsPage from "./app/deliveryTerms";
import Download from "./app/download";
import LandingPage from "./app/LandingPage";
import CategoriesPage from "./app/CategoriesPage";
import AboutPage from "./app/AboutPage";
import ContactPage from "./app/ContactPage";
import CheckoutPage from "./app/CheckoutPage";
function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <div className="bg-custom">
          <Router>
            <div>
              <ToastContainer  autoClose={3000} />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/shop" element={<Home />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/dashboard" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/download" element={<Download />} />
                <Route path="/terms-and-conditions" element={<Terms />} />
                <Route path="/privacy-policy" element={<Privacy />} />
                <Route path="/delivery-terms" element={<DeliveryTermsPage />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/control" element={<ProtectedRoute><ControlPanel /></ProtectedRoute>} />
                <Route path="/package" element={<ProtectedRoute><Package /></ProtectedRoute>} />
              </Routes>
            </div>
          </Router>
        </div>
      </PersistGate>
    </Provider>
  );
}

export default App;
