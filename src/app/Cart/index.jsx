import React, { useState } from 'react';
import Nav from '../../components/Nav';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import successToast from '../UserNotifications/successToast';
import errorToast from '../UserNotifications/errorToast';
import infoToast from '../UserNotifications/infoToast';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

// Initialize Stripe with a placeholder key (replace with your actual key later)
const stripePromise = loadStripe('your-publishable-key-here');

function CheckoutForm({ onClose, finalAmount }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      errorToast(error.message);
    } else {
      successToast('Payment successful!');
      console.log('[PaymentMethod]', paymentMethod);
      onClose(); // Close the modal on successful payment
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <h4>Total Amount: ${finalAmount.toFixed(2)}</h4>
      <Button type="submit" className="mt-3 w-100" disabled={!stripe || isLoading}>
        {isLoading ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  );
}

function Index() {
  const cart = useSelector((state) => state.cart.items);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [deliveryCost] = useState(10); // Fixed delivery cost, change logic as necessary

  // Calculate the total price of the items
  const totalPrice = Object.values(cart).reduce((total, item) => {
    return total + item.Price * item.quantity;
  }, 0);

  // Calculate the final amount (total price + delivery cost)
  const finalAmount = totalPrice + deliveryCost;

  const handleCheckout = (method) => {
    setSelectedPaymentMethod(method);
    setShowCheckoutModal(false); // Close the payment method selection modal immediately

    if (method === 'mpesa') {
      successToast('Proceeding with Mpesa payment.');
      // Additional Mpesa handling logic here
    } else if (method === 'airtel') {
      successToast('Proceeding with Airtel Money payment.');
      // Additional Airtel Money handling logic here
    } else if (method === 'visa') {
      successToast('Proceeding with Visa/Mastercard payment.');
    }
  };

  return (
    <div>
      <Nav />
      <div className="container mt-4 pb-5 h-100">
        <h3>Shopping Cart</h3>

        {Object.keys(cart).length === 0 ? (
          errorToast('Your cart is empty.')
        ) : (
          <div>
            {Object.values(cart).map((item, index) => (
              <div key={index} className="d-flex justify-content-between align-items-start mb-3 p-3 border">
                <div className=''>
                  <h5>{item.Name}</h5>
                  <p>Price: ${item.Price}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <div>
                  <img
                    src={item.Image}
                    alt={item.Name}
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                </div>
              </div>
            ))}

            <h4>Total Price: ${totalPrice.toFixed(2)}</h4>
            <h4>Delivery Cost: ${deliveryCost}</h4>
            <h4>Final Cost: ${finalAmount.toFixed(2)}</h4>

            <div className="mt-4">
              <Link to="/home">
                <button className="btn btn-secondary me-3" onClick={() => infoToast('Back to Shopping')}>
                  Back to Shopping
                </button>
              </Link>
              <button className="btn btn-primary" onClick={() => setShowCheckoutModal(true)}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Payment Methods */}
      <Modal show={showCheckoutModal} onHide={() => setShowCheckoutModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Select Payment Method</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column">
            <button
              className="btn btn-success mb-2"
              onClick={() => handleCheckout('mpesa')}
            >
              Pay via Mpesa
            </button>
            <button
              className="btn btn-danger mb-2"
              onClick={() => handleCheckout('airtel')}
            >
              Pay via Airtel Money
            </button>
            <button
              className="btn btn-primary mb-2"
              onClick={() => handleCheckout('visa')}
            >
              Pay via Visa/Mastercard
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal for Visa/MasterCard Payment */}
      <Modal
        show={selectedPaymentMethod === 'visa'}
        onHide={() => setSelectedPaymentMethod('')}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Card Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Elements stripe={stripePromise}>
            <CheckoutForm onClose={() => setSelectedPaymentMethod('')} finalAmount={finalAmount} />
          </Elements>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Index;
