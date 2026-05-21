// src/app/Cart/index.jsx

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Nav from '../../components/Nav';
import successToast from '../UserNotifications/successToast';
import errorToast from '../UserNotifications/errorToast';
import infoToast from '../UserNotifications/infoToast';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { removeItemFromCart, clearCart } from '../../redux/slices/cartSlice';
import axios from 'axios';
import { baseUrl } from '../../constants';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';

const stripePromise = loadStripe();

// Card Element styling options
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSize: '16px',
      '::placeholder': { color: '#a0aec0' },
      padding: '10px',
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

/**
 * CheckoutForm
 * Renders Stripe Card Elements and handles card-based checkout.
 */
function CheckoutForm({ onClose, finalAmount }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    const cardEl = elements.getElement(CardNumberElement);
    const { error } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardEl,
    });

    if (error) {
      errorToast(error.message);
    } else {
      successToast('Card payment successful!');
      onClose();
      // TODO: Trigger server-side payment confirmation if required
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Card Number</label>
        <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      <div className="d-flex gap-3 mb-3">
        <div className="flex-fill">
          <label className="form-label">Expiry</label>
          <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <div className="flex-fill">
          <label className="form-label">CVC</label>
          <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>
      <h5>Total: KSH {finalAmount.toFixed(2)}</h5>
      <Button type="submit" className="w-100" disabled={!stripe || isLoading}>
        {isLoading ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  );
}

/**
 * Cart
 * Primary shopping cart component handling display, summary, and checkout workflows.
 */
export default function Cart() {
  const dispatch = useDispatch();
  const cartItems = useSelector((s) => s.cart.items);
  const products = useSelector((s) => s.products.products);
  const user = useSelector((s) => s.auth.user);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const navigate = useNavigate();

  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [apiLoading, setApiLoading] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [kraPinInput, setKraPinInput] = useState('');

  const deliveryCost = 10;
  const fusedItems = Object.values(cartItems).map((item) => {
    const product = products.find((p) => p.id === item.id) || {};
    return { ...item, ...product, quantity: item.quantity, id: item.id };
  });

  // Calculate subtotal and VAT
  const { subtotal, vatTotal } = fusedItems.reduce(
    (acc, item) => {
      const qty = item.quantity;
      const price = parseFloat(item.price || 0);
      const discountThreshold = parseFloat(item.discountQuantity ?? Infinity);
      const discounted = item.priceAfterDiscount != null
        ? parseFloat(item.priceAfterDiscount)
        : null;
      const unitPrice = discounted !== null && qty >= discountThreshold
        ? discounted
        : price;
      const lineTotal = unitPrice * qty;
      acc.subtotal += lineTotal;
      acc.vatTotal += lineTotal * (parseFloat(item.taxRate) || 0);
      return acc;
    },
    { subtotal: 0, vatTotal: 0 }
  );

  const finalCost = subtotal + vatTotal + deliveryCost;
  const capExceeded = fusedItems.some(
    (item) =>
      item.purchaseCap != null && item.quantity > Number(item.purchaseCap)
  );

  /**
   * handleNonCard
   * Orchestrates MPesa / Airtel checkout with fallback to Nairobi CBD coordinates.
   *
   * NOTE: payload.orderItems now includes priceType: "Discounted" | "Retail"
   * depending on whether the discount quantity threshold was met.
   */
  const handleNonCard = async (method) => {
    if (!phoneInput.trim()) {
      errorToast('Phone number is required.');
      return;
    }

    setSelectedMethod(method);

    if (method === 'mpesa') {
      setApiLoading(true);

      // Default to Nairobi CBD on geolocation failure
      let coords = { lat: -1.28333, lng: 36.81667 };
      try {
        const res = await axios.post(
          `https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}`
        );
        coords = res.data.location;
      } catch {
        infoToast('Proceeding with default location (Nairobi CBD).');
      }

      // Build payload with priceType per item
      const payload = {
        userId: user.phone,
        orderSource:"Ecommerce",
        orderPaymentType: 'Mpesa',
        phoneNumber: phoneInput.trim(),
        buyerPin: kraPinInput.trim() || 'N/A',
        latitude: coords.lat,
        longitude: coords.lng,
        orderItems: fusedItems.map((i) => {
          const qty = i.quantity;
          const discountThreshold = parseFloat(i.discountQuantity ?? Infinity);
          const discounted = i.priceAfterDiscount != null
            ? parseFloat(i.priceAfterDiscount)
            : null;
          const isDiscounted = discounted !== null && qty >= discountThreshold;
          return {
            productId: Number(i.id),
            quantity: qty,
            priceType: isDiscounted ? 'Discounted' : 'Retail',
          };
        }),
      };

      // Log the payload so you can verify priceType fields client-side
      console.log('Order payload (mpesa):', payload);

      try {
        await axios.post(`${baseUrl}/order`, payload ,
           {
            headers: {
              'Content-Type': 'application/json',
            },}
              );
        successToast('Mpesa order successfully initiated.');
      } catch (err) {
        errorToast(err.response?.data || 'Mpesa payment failed.');
      } finally {
        setApiLoading(false);
        setShowCheckout(false);
      }
    }

    if (method === 'airtel') {
      // For Airtel we also prepare and log the payload similarly before implementing API
      const payload = {
        userId: user.phone,
        orderPaymentType: 'Airtel',
        phoneNumber: phoneInput.trim(),
        buyerPin: kraPinInput.trim() || 'N/A',
        latitude: null,
        longitude: null,
        orderItems: fusedItems.map((i) => {
          const qty = i.quantity;
          const discountThreshold = parseFloat(i.discountQuantity ?? Infinity);
          const discounted = i.priceAfterDiscount != null
            ? parseFloat(i.priceAfterDiscount)
            : null;
          const isDiscounted = discounted !== null && qty >= discountThreshold;
          return {
            productId: Number(i.id),
            quantity: qty,
            priceType: isDiscounted ? 'Discounted' : 'Retail',
          };
        }),
      };

      console.log('Order payload (airtel):', payload);

      successToast('Airtel Money flow started.');
      setShowCheckout(false);
      // TODO: Implement Airtel API integration with the above payload
    }
  };

  /**
   * initiateCheckout
   * Validates purchase caps then displays the summary modal.
   */
  const initiateCheckout = () => {
    if (!isAuthenticated) {
      infoToast('Please login to continue with checkout.');
      navigate('/login');
      return;
    }
    if (capExceeded) {
      errorToast('One or more items exceed their purchase limit.');
      return;
    }
    setShowCheckout(true);
  };

  return (
    <>
      <Nav />

      <div className="container mt-5 pb-5">
        <div className="d-flex align-items-center justify-content-between mb-5">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: '#111827', letterSpacing: '-0.025em' }}>Shopping Cart</h2>
            <p className="text-muted mb-0">{fusedItems.length} {fusedItems.length === 1 ? 'item' : 'items'} in your cart</p>
          </div>
          {fusedItems.length > 0 && (
            <button
              className="btn btn-link text-danger text-decoration-none fw-semibold p-0"
              onClick={() => {
                dispatch(clearCart());
                infoToast('Cart cleared.');
              }}
            >
              Clear Cart
            </button>
          )}
        </div>

        {fusedItems.length === 0 ? (
          <div className="text-center py-5 border rounded-4 bg-white shadow-sm">
            <div className="mb-4">
              <ShoppingCartRoundedIcon sx={{ fontSize: 64, color: '#e5e7eb' }} />
            </div>
            <h4 className="fw-bold text-gray-900">Your cart is empty</h4>
            <p className="text-muted mb-4">Looks like you haven't added anything to your cart yet.</p>
            <Link to="/shop">
              <Button variant="primary" style={{ borderRadius: '50px', padding: '0.75rem 2rem', fontWeight: 600 }}>
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {/* Left Column: Cart Items */}
            <div className="col-lg-8">
              <div className="d-flex flex-column gap-3">
                {fusedItems.map((item) => {
                  const qty = item.quantity;
                  const base = parseFloat(item.price);
                  const threshold = parseFloat(item.discountQuantity ?? Infinity);
                  const discounted = item.priceAfterDiscount != null
                    ? parseFloat(item.priceAfterDiscount)
                    : null;
                  const unitPrice = discounted !== null && qty >= threshold
                    ? discounted
                    : base;
                  const lineTotal = unitPrice * qty;
                  const vatAmount = lineTotal * (parseFloat(item.taxRate) || 0);

                  return (
                    <div
                      key={item.id}
                      className="d-flex flex-column flex-sm-row align-items-center p-3 bg-white border-0 shadow-sm rounded-4 gap-4"
                      style={{ transition: 'all 0.2s ease' }}
                    >
                      <div className="flex-shrink-0">
                        {item.productimages?.[0] || item.imageUrl ? (
                          <img
                            src={item.productimages?.[0] || item.imageUrl}
                            alt={item.name}
                            style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '12px' }}
                          />
                        ) : (
                          <div style={{ width: 100, height: 100, backgroundColor: '#f3f4f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingCartRoundedIcon sx={{ color: '#9ca3af' }} />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow-1 text-center text-sm-start">
                        <h5 className="fw-bold mb-1" style={{ color: '#111827' }}>{item.name || 'Unnamed Product'}</h5>
                        <p className="text-muted small mb-2">{item.categoryName || 'General'}</p>
                        <div className="d-flex flex-wrap justify-content-center justify-content-sm-start gap-3 align-items-center">
                          <span className="fw-bold text-primary" style={{ fontSize: '1.1rem', color: '#c85d00' }}>
                            KSH {unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <span className="badge bg-light text-dark border py-2 px-3 rounded-pill fw-semibold">
                            Qty: {qty}
                          </span>
                        </div>
                        {item.purchaseCap && (
                          <p className="text-danger small mt-2 mb-0 fw-medium">
                            Limit: {item.purchaseCap} units
                          </p>
                        )}
                      </div>
                      <div className="text-center text-sm-end ms-sm-auto">
                        <p className="fw-bold mb-2" style={{ fontSize: '1.2rem', color: '#111827' }}>
                          KSH {(lineTotal + vatAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <button
                          className="btn btn-outline-danger btn-sm rounded-pill px-3"
                          style={{ fontSize: '0.8rem', fontWeight: 600 }}
                          onClick={() => {
                            dispatch(removeItemFromCart(item.id));
                            infoToast(`${item.name} removed.`);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="col-lg-4">
              <div className="bg-white p-4 rounded-4 shadow-sm sticky-top" style={{ top: '100px', zIndex: 10 }}>
                <h4 className="fw-bold mb-4" style={{ color: '#111827' }}>Order Summary</h4>
                
                <div className="d-flex flex-column gap-3 mb-4">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Subtotal</span>
                    <span className="fw-medium">KSH {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">VAT Total</span>
                    <span className="fw-medium">KSH {vatTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Delivery Cost</span>
                    <span className="fw-medium">KSH {deliveryCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold h5 mb-0">Total</span>
                    <span className="fw-bold h4 mb-0" style={{ color: '#c85d00' }}>KSH {finalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-100 py-3 rounded-pill fw-bold shadow-sm"
                  style={{ fontSize: '1.1rem', backgroundColor: '#c85d00', border: 'none' }}
                  onClick={initiateCheckout}
                >
                  Proceed to Checkout
                </Button>
                
                <div className="mt-4 text-center">
                  <Link to="/shop" className="text-muted text-decoration-none small fw-medium">
                    ← Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Summary Modal */}
      <Modal
        show={showCheckout}
        onHide={() => setShowCheckout(false)}
        centered
        size="lg"
        contentClassName="border-0 shadow-lg"
        style={{ borderRadius: '24px' }}
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title sx={{ fontWeight: 800, color: '#111827' }}>Checkout Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="mb-5">
            <h5 className="fw-bold mb-3" style={{ color: '#111827' }}>Delivery Details</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted text-uppercase">Phone Number *</label>
                <input
                  type="text"
                  className="form-control form-control-lg bg-light border-0"
                  style={{ borderRadius: '12px' }}
                  placeholder="254XXXXXXXX"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted text-uppercase">KRA Tax Pin (Optional)</label>
                <input
                  type="text"
                  className="form-control form-control-lg bg-light border-0"
                  style={{ borderRadius: '12px' }}
                  placeholder="Enter KRA PIN"
                  value={kraPinInput}
                  onChange={(e) => setKraPinInput(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mb-5">
            <h5 className="fw-bold mb-3" style={{ color: '#111827' }}>Order Items</h5>
            <div className="table-responsive">
              <table className="table table-borderless align-middle">
                <thead>
                  <tr className="border-bottom">
                    <th className="text-muted small fw-bold text-uppercase pb-3">Item</th>
                    <th className="text-muted small fw-bold text-uppercase pb-3 text-center">Qty</th>
                    <th className="text-muted small fw-bold text-uppercase pb-3 text-end">Price</th>
                    <th className="text-muted small fw-bold text-uppercase pb-3 text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {fusedItems.map((item, idx) => {
                    const qty = item.quantity;
                    const base = parseFloat(item.price);
                    const threshold = parseFloat(item.discountQuantity ?? Infinity);
                    const discounted = item.priceAfterDiscount != null
                      ? parseFloat(item.priceAfterDiscount)
                      : null;
                    const unit = discounted !== null && qty >= threshold
                      ? discounted
                      : base;
                    const sub = unit * qty;
                    const vat = sub * (parseFloat(item.taxRate) || 0);
                    return (
                      <tr key={idx} className="border-bottom">
                        <td className="py-3">
                          <span className="fw-semibold" style={{ color: '#111827' }}>{item.name}</span>
                        </td>
                        <td className="py-3 text-center">{qty}</td>
                        <td className="py-3 text-end">KSH {unit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 text-end fw-bold">KSH {(sub + vat).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-light p-4 rounded-4 mb-5">
            <div className="d-flex flex-column gap-2">
              <div className="d-flex justify-content-between text-muted">
                <span>Subtotal</span>
                <span>KSH {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="d-flex justify-content-between text-muted">
                <span>VAT Total</span>
                <span>KSH {vatTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="d-flex justify-content-between text-muted">
                <span>Delivery Fee</span>
                <span>KSH {deliveryCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold h5 mb-0">Grand Total</span>
                <span className="fw-bold h4 mb-0" style={{ color: '#c85d00' }}>KSH {finalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="d-flex flex-column gap-3">
            <h5 className="fw-bold mb-1" style={{ color: '#111827' }}>Select Payment Method</h5>
            <div className="row g-3">
              <div className="col-md-4">
                <Button
                  variant="outline-success"
                  className="w-100 py-3 rounded-4 fw-bold border-2 d-flex flex-column align-items-center gap-2"
                  onClick={() => handleNonCard('mpesa')}
                >
                  <span style={{ fontSize: '1.2rem' }}>💸</span>
                  Mpesa
                </Button>
              </div>
              <div className="col-md-4">
                <Button
                  variant="outline-danger"
                  className="w-100 py-3 rounded-4 fw-bold border-2 d-flex flex-column align-items-center gap-2"
                  onClick={() => handleNonCard('airtel')}
                >
                  <span style={{ fontSize: '1.2rem' }}>📱</span>
                  Airtel
                </Button>
              </div>
              <div className="col-md-4">
                <Button
                  variant="outline-primary"
                  className="w-100 py-3 rounded-4 fw-bold border-2 d-flex flex-column align-items-center gap-2"
                  onClick={() => setSelectedMethod('visa')}
                >
                  <span style={{ fontSize: '1.2rem' }}>💳</span>
                  Card
                </Button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Card Payment Modal */}
      <Modal
        show={selectedMethod === 'visa'}
        onHide={() => setSelectedMethod('')}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Card Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Elements stripe={stripePromise}>
            <CheckoutForm
              onClose={() => setSelectedMethod('')}
              finalAmount={finalCost}
            />
          </Elements>
        </Modal.Body>
      </Modal>

      {/* API Loading Spinner */}
      <Modal show={apiLoading} backdrop="static" keyboard={false} centered>
        <Modal.Body className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Processing your request...</p>
        </Modal.Body>
      </Modal>
    </>
  );
}
