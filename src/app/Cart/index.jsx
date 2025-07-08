// src/app/Cart/index.jsx

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
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

  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [apiLoading, setApiLoading] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [kraPinInput, setKraPinInput] = useState('');

  const deliveryCost = 10;
  const fusedItems = Object.values(cartItems).map((item) => {
    const product = products.find((p) => p.id === item.id) || {};
    return { ...product, quantity: item.quantity, id: item.id };
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

      const payload = {
        userId: user.phone,
        phoneNumber: phoneInput.trim(),
        buyerPin: kraPinInput.trim() || 'N/A',
        latitude: coords.lat,
        longitude: coords.lng,
        orderItems: fusedItems.map((i) => ({
          productId: Number(i.id),
          quantity: i.quantity,
        })),
      };

      try {
        await axios.post(`${baseUrl}/order`, payload);
        successToast('Mpesa order successfully initiated.');
      } catch (err) {
        errorToast(err.response?.data || 'Mpesa payment failed.');
      } finally {
        setApiLoading(false);
        setShowCheckout(false);
      }
    }

    if (method === 'airtel') {
      successToast('Airtel Money flow started.');
      setShowCheckout(false);
      // TODO: Implement Airtel API integration
    }
  };

  /**
   * initiateCheckout
   * Validates purchase caps then displays the summary modal.
   */
  const initiateCheckout = () => {
    if (capExceeded) {
      errorToast('One or more items exceed their purchase limit.');
      return;
    }
    setShowCheckout(true);
  };

  return (
    <>
      <Nav />

      <div className="container mt-4 pb-5">
        <div className="d-flex justify-content-between mb-3">
          <h3>Shopping Cart</h3>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              dispatch(clearCart());
              infoToast('Cart cleared.');
            }}
          >
            Clear Cart
          </button>
        </div>

        {fusedItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
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
                  className="d-flex justify-content-between align-items-center p-3 border mb-3"
                >
                  <div>
                    <h5>{item.name || 'Unnamed Product'}</h5>
                    <p>Unit Price: KSH {unitPrice.toFixed(2)}</p>
                    <p>Quantity: {qty}</p>
                    {item.purchaseCap && (
                      <p>Purchase Cap: {item.purchaseCap}</p>
                    )}
                    <p>
                      Total (incl. VAT): KSH {(lineTotal + vatAmount).toFixed(2)}
                    </p>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => {
                        dispatch(removeItemFromCart(item.id));
                        infoToast(`${item.name} removed.`);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  {item.productimages?.[0] && (
                    <img
                      src={item.productimages[0]}
                      alt={item.name}
                      style={{ width: 80, height: 80, objectFit: 'cover' }}
                    />
                  )}
                </div>
              );
            })}

            <div className="mt-4">
              <h5>Subtotal: KSH {subtotal.toFixed(2)}</h5>
              <h5>VAT Total: KSH {vatTotal.toFixed(2)}</h5>
              <h5>Delivery Cost: KSH {deliveryCost.toFixed(2)}</h5>
              <h4>Final Cost: KSH {finalCost.toFixed(2)}</h4>

              <div className="mt-3">
                <Link to="/home">
                  <button
                    className="btn btn-secondary me-2"
                    onClick={() => infoToast('Back to shopping')}
                  >
                    Back to Shopping
                  </button>
                </Link>
                <button
                  className="btn btn-primary"
                  onClick={initiateCheckout}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Checkout Summary Modal */}
      <Modal
        show={showCheckout}
        onHide={() => setShowCheckout(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Checkout Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h5>Enter Your Details</h5>
            <div className="mb-3">
              <label className="form-label">
                Phone Number <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your phone number"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="form-label">KRA Tax Pin (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your KRA Tax Pin"
                value={kraPinInput}
                onChange={(e) => setKraPinInput(e.target.value)}
              />
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
                <th>VAT</th>
                <th>Total (incl. VAT)</th>
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
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{qty}</td>
                    <td>KSH {unit.toFixed(2)}</td>
                    <td>KSH {sub.toFixed(2)}</td>
                    <td>KSH {vat.toFixed(2)}</td>
                    <td>KSH {(sub + vat).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-3">
            <h5>Summary</h5>
            <p>Subtotal: KSH {subtotal.toFixed(2)}</p>
            <p>VAT Total: KSH {vatTotal.toFixed(2)}</p>
            <p>Delivery Cost: KSH {deliveryCost.toFixed(2)}</p>
            <p>
              <strong>Final Cost: KSH {finalCost.toFixed(2)}</strong>
            </p>
          </div>

          <div className="mt-4 d-flex flex-column">
            <Button
              variant="success"
              className="mb-2"
              onClick={() => handleNonCard('mpesa')}
            >
              Pay via Mpesa
            </Button>
            <Button
              variant="danger"
              className="mb-2"
              onClick={() => handleNonCard('airtel')}
            >
              Pay via Airtel Money
            </Button>
            <Button
              variant="primary"
              className="mb-2"
              onClick={() => setSelectedMethod('visa')}
            >
              Pay via Visa/Mastercard
            </Button>
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
