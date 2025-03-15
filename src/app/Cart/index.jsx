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
import { removeItemFromCart, clearCart } from '../../redux/slices/cartSlice';
import { processMpesaPayment } from '../../services/mpesa'; // Adjust this path

const stripePromise = loadStripe('your-publishable-key-here');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSize: '16px',
      '::placeholder': {
        color: '#a0aec0',
      },
      padding: '10px',
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

function CheckoutForm({ onClose, finalAmount }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setIsLoading(true);

    const cardNumberElement = elements.getElement(CardNumberElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardNumberElement,
    });

    if (error) {
      errorToast(error.message);
    } else {
      successToast('Payment successful!');
      console.log('[PaymentMethod]', paymentMethod);
      onClose();
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Card Number</label>
        <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Expiry Date</label>
          <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>CVC</label>
          <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>
      <h4>Total Amount: KSH {finalAmount.toFixed(2)}</h4>
      <Button type="submit" className="mt-3 w-100" disabled={!stripe || isLoading}>
        {isLoading ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  );
}

function Cart() {
  const dispatch = useDispatch();
  // Retrieve cart items and product details from Redux.
  const cartItems = useSelector((state) => state.cart.items);
  const products = useSelector((state) => state.products.products);
  // Retrieve phone number from the auth slice.
  const phoneNumber = useSelector((state) => state.auth.user?.phone);

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const deliveryCost = 10;

  // Merge minimal cart data with full product details.
  const fusedCartItems = Object.values(cartItems).map((item) => {
    const productData = products.find((prod) => prod.id === item.id) || {};
    return { ...productData, quantity: item.quantity };
  });

  // Compute totals.
  const computedTotals = fusedCartItems.reduce(
    (acc, item) => {
      const quantity = item.quantity || 0;
      const basePrice = item.price ? parseFloat(item.price) : 0;
      const discountQuantity = item.discountQuantity ? parseFloat(item.discountQuantity) : Infinity;
      const discountedPrice =
        item.priceAfterDiscount === null || item.priceAfterDiscount === undefined
          ? null
          : parseFloat(item.priceAfterDiscount);
      const effectivePrice =
        discountedPrice === null ? basePrice : (quantity >= discountQuantity ? discountedPrice : basePrice);
      const itemSubtotal = effectivePrice * quantity;
      const taxRate = item.taxRate ? parseFloat(item.taxRate) : 0;
      const itemVat = itemSubtotal * taxRate;
      acc.subtotal += itemSubtotal;
      acc.vat += itemVat;
      return acc;
    },
    { subtotal: 0, vat: 0 }
  );

  const subtotal = computedTotals.subtotal;
  const vatTotal = computedTotals.vat;
  const finalCost = subtotal + vatTotal + deliveryCost;

  // Check for purchase cap violations.
  const isAnyProductCapExceeded = fusedCartItems.some((item) => {
    if (item.purchaseCap != null) {
      return item.quantity > parseInt(item.purchaseCap);
    }
    return false;
  });

  const handleCheckout = async (method) => {
    setSelectedPaymentMethod(method);
    if (method === 'mpesa') {
      successToast('Proceeding with Mpesa payment.');
      // Use the phone number from Redux; ensure it's in the correct format (e.g., 2547XXXXXXXX)
      const accountReference = 'YOUR_ACCOUNT_REF';
      const transactionDesc = 'Payment for purchase';
      const callbackURL = 'https://yourwebsite.com/callback';

      try {
        const response = await processMpesaPayment({
          amount: finalCost,
          phoneNumber, // from Redux auth slice
          accountReference,
          transactionDesc,
          callbackURL,
        });
        successToast('Mpesa payment initiated successfully.');
        console.log('Mpesa response:', response);
      } catch (error) {
        errorToast('Mpesa payment failed.');
        console.error(error);
      }
      setShowCheckoutModal(false);
    } else if (method === 'airtel') {
      successToast('Proceeding with Airtel Money payment.');
      setShowCheckoutModal(false);
    } else if (method === 'visa') {
      successToast('Proceeding with Visa/Mastercard payment.');
      // The card payment modal will appear.
    }
  };

  const handleProceedToCheckout = () => {
    if (isAnyProductCapExceeded) {
      errorToast('One or more products exceed their purchase limit.');
    } else {
      setShowCheckoutModal(true);
    }
  };

  return (
    <div>
      <Nav />
      <div className="container mt-4 pb-5 h-100">
        <div className="d-flex justify-content-between align-items-center mb-3">
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
        {fusedCartItems.length === 0 ? (
          errorToast('Your cart is empty.')
        ) : (
          <div>
            {fusedCartItems.map((item, index) => {
              const quantity = item.quantity || 0;
              const basePrice = item.price ? parseFloat(item.price) : 0;
              const discountQuantity = item.discountQuantity ? parseFloat(item.discountQuantity) : Infinity;
              const discountedPrice =
                item.priceAfterDiscount === null || item.priceAfterDiscount === undefined
                  ? null
                  : parseFloat(item.priceAfterDiscount);
              const effectivePrice =
                discountedPrice === null ? basePrice : (quantity >= discountQuantity ? discountedPrice : basePrice);
              const itemSubtotal = effectivePrice * quantity;
              const taxRate = item.taxRate ? parseFloat(item.taxRate) : 0;
              const itemVat = itemSubtotal * taxRate;
              const totalWithVat = itemSubtotal + itemVat;
              const productName = item.name || item.Name || 'Unnamed Product';
              const productImage =
                item.productimages && item.productimages.length > 0
                  ? item.productimages[0]
                  : item.Image || item.image || '';
              return (
                <div key={index} className="d-flex justify-content-between align-items-start mb-3 p-3 border">
                  <div>
                    <h5>{productName}</h5>
                    <p>
                      Unit Price: KSH {effectivePrice.toFixed(2)}
                      {quantity >= discountQuantity && discountedPrice != null && (
                        <span className="text-success ms-2">(Discount Applied)</span>
                      )}
                    </p>
                    <p>Quantity: {quantity}</p>
                    {item.purchaseCap && (
                      <p>
                        Purchase Limit: {item.purchaseCap}{' '}
                        {quantity > parseInt(item.purchaseCap) && (
                          <span className="text-danger">(Exceeded!)</span>
                        )}
                      </p>
                    )}
                    <p>Subtotal: KSH {itemSubtotal.toFixed(2)}</p>
                    <p>VAT: KSH {itemVat.toFixed(2)}</p>
                    <p>
                      <strong>Total (incl. VAT): KSH {totalWithVat.toFixed(2)}</strong>
                    </p>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        dispatch(removeItemFromCart(item.id));
                        infoToast(`${productName} removed from cart.`);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  <div>
                    {productImage && (
                      <img
                        src={productImage}
                        alt={productName}
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            <div className="mt-4">
              <h4>Subtotal: KSH {subtotal.toFixed(2)}</h4>
              <h4>VAT Total: KSH {vatTotal.toFixed(2)}</h4>
              <h4>Delivery Cost: KSH {deliveryCost.toFixed(2)}</h4>
              <h4>Final Cost: KSH {finalCost.toFixed(2)}</h4>
              <div className="mt-4">
                <Link to="/home">
                  <button className="btn btn-secondary me-3" onClick={() => infoToast('Back to Shopping')}>
                    Back to Shopping
                  </button>
                </Link>
                <button className="btn btn-primary" onClick={handleProceedToCheckout}>
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Summary Modal */}
      <Modal show={showCheckoutModal} onHide={() => setShowCheckoutModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Checkout Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {fusedCartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                    <th>VAT</th>
                    <th>Total (incl. VAT)</th>
                  </tr>
                </thead>
                <tbody>
                  {fusedCartItems.map((item, index) => {
                    const quantity = item.quantity || 0;
                    const basePrice = item.price ? parseFloat(item.price) : 0;
                    const discountQuantity = item.discountQuantity ? parseFloat(item.discountQuantity) : Infinity;
                    const discountedPrice =
                      item.priceAfterDiscount === null || item.priceAfterDiscount === undefined
                        ? null
                        : parseFloat(item.priceAfterDiscount);
                    const effectivePrice =
                      discountedPrice === null ? basePrice : (quantity >= discountQuantity ? discountedPrice : basePrice);
                    const itemSubtotal = effectivePrice * quantity;
                    const taxRate = item.taxRate ? parseFloat(item.taxRate) : 0;
                    const itemVat = itemSubtotal * taxRate;
                    const totalWithVat = itemSubtotal + itemVat;
                    const productName = item.name || item.Name || 'Unnamed Product';
                    return (
                      <tr key={index}>
                        <td>{productName}</td>
                        <td>{quantity}</td>
                        <td>KSH {effectivePrice.toFixed(2)}</td>
                        <td>KSH {itemSubtotal.toFixed(2)}</td>
                        <td>KSH {itemVat.toFixed(2)}</td>
                        <td>KSH {totalWithVat.toFixed(2)}</td>
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
              <div className="mt-4">
                <div className="d-flex flex-column">
                  <button className="btn btn-success mb-2" onClick={() => handleCheckout('mpesa')}>
                    Pay via Mpesa
                  </button>
                  <button className="btn btn-danger mb-2" onClick={() => handleCheckout('airtel')}>
                    Pay via Airtel Money
                  </button>
                  <button className="btn btn-primary mb-2" onClick={() => handleCheckout('visa')}>
                    Pay via Visa/Mastercard
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Card Payment Modal for Visa/Mastercard */}
      <Modal show={selectedPaymentMethod === 'visa'} onHide={() => setSelectedPaymentMethod('')} centered>
        <Modal.Header closeButton>
          <Modal.Title>Card Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Elements stripe={stripePromise}>
            <CheckoutForm onClose={() => setSelectedPaymentMethod('')} finalAmount={finalCost} />
          </Elements>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Cart;
