import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/boostrapCustom.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faUser as User } from '@fortawesome/free-regular-svg-icons';
import logo from '../../assets/logo.jpeg';
import { loginUser } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { Modal, Button, Form } from 'react-bootstrap';

function Index() {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const dispatch = useDispatch();
  const { isAuthenticated, error, isLoading } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Remember me and password toggle states
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // States for Forgot Password flow (three-step process)
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('+254');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // On mount, load saved credentials if available.
  // Also, default the phone input to "+254" if not already saved.
  useEffect(() => {
    const savedPhone = localStorage.getItem('rememberedPhone');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedPhone && savedPassword) {
      setValue('phone', savedPhone);
      setValue('password', savedPassword);
      setRememberMe(true);
    } else {
      setValue('phone', '+254');
    }
  }, [setValue]);

  // Handle login submission
  const onSubmit = (data) => {
    const credentials = {
      username: data.phone,
      password: data.password,
    };

    if (rememberMe) {
      localStorage.setItem('rememberedPhone', data.phone);
      localStorage.setItem('rememberedPassword', data.password);
    } else {
      localStorage.removeItem('rememberedPhone');
      localStorage.removeItem('rememberedPassword');
    }

    dispatch(loginUser(credentials));
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/Home');
    }
  }, [isAuthenticated, navigate]);

  // ----- Forgot Password Flow Handlers -----

  // Step 1: Send OTP using the provided phone number.
  const handleSendOtp = () => {
    if (!forgotPhone.match(/^\+254[0-9]{9}$/)) {
      toast.error('Phone number must start with +254 followed by exactly 9 digits.');
      return;
    }
    toast.info(`OTP sent to ${forgotPhone}`);
    setShowForgotModal(false);
    setShowOtpModal(true);
  };

  // Step 2: Verify OTP entered by the user.
  const handleVerifyOtp = () => {
    if (enteredOtp !== '123456') {
      toast.error('Incorrect OTP.');
      return;
    }
    toast.success('OTP verified!');
    setShowOtpModal(false);
    setShowResetModal(true);
  };

  // Step 3: Reset the password.
  const handleResetPassword = () => {
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    toast.success('Password updated successfully!');
    setShowResetModal(false);
    // Optionally clear reset fields:
    setEnteredOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleNavigate = () => {
    navigate('/');
  };

  return (
    <div className="bg-custom">
      <div className="container pb-5 pt-3">
        <div className="row">
          {/* Left Column: Image with Version Ribbon (as in registration) */}
          <div className="col-md-6 position-relative p-0">
            <img
              src={logo}
              alt="Arpella logo"
              className="img-fluid rounded w-100 h-100"
              style={{ objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '40px',
                left: '0',
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: '#fff',
                textAlign: 'center',
                padding: '8px 0',
                fontSize: '1rem',
                fontWeight: 'bold',
              }}
            >
              App Version 0.0.4
            </div>
          </div>

          {/* Right Column: Login Form */}
          <div className="col-md-6">
            <h2 className="text-center font-weight-bold mb-2">Welcome back to Arpella</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group mb-3 text-start">
                <label>Phone Number:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="+254XXXXXXXXX"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                     // value: /^\+254[0-9]{9}$/,
                      message: 'Phone number must start with +254 followed by exactly 9 digits',
                    },
                  })}
                />
                {errors.phone && <small className="text-danger">{errors.phone.message}</small>}
              </div>

              {/* Header Row: Password label on left, Forgot Password link on right */}
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="mb-0">Password:</label>
                <small
                  style={{ color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => {
                    // Set default value for forgot phone as +254 before opening modal
                    setForgotPhone('+254');
                    setShowForgotModal(true);
                  }}
                >
                  Forgot Password?
                </small>
              </div>

              {/* Password Input with inline Toggle Button using Input Group */}
              <div className="input-group mb-3">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="form-control"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {errors.password && <small className="text-danger">{errors.password.message}</small>}

              {/* Remember Me Checkbox */}
              <div className="form-group mb-3 text-start">
                <Form.Check
                  type="checkbox"
                  id="rememberMe"
                  label="Remember Me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 mb-3">
                {isLoading ? 'Logging in...' : 'Login'}
              </button>

              <div className="text-center font-weight-bold mb-3"> or </div>
              <div className="d-grid gap-3">
                <Button type="button" onClick={handleNavigate} variant="outline-dark">
                  <FontAwesomeIcon icon={User} /> Don't have an account? Register
                </Button>
                <Button type="button" variant="outline-danger">
                  <FontAwesomeIcon icon={faGoogle} /> Login with Google
                </Button>
                <Button type="button" variant="outline-primary">
                  <FontAwesomeIcon icon={faFacebook} /> Login with Facebook
                </Button>
              </div>
              {error && <small className="text-danger">{error}</small>}
            </form>
          </div>
        </div>
      </div>

      {/* --- Forgot Password Flow Modals --- */}

      {/* Step 1: Forgot Password Modal (enter phone number) */}
      <Modal
        show={showForgotModal}
        onHide={() => setShowForgotModal(false)}
        backdrop="static"
        keyboard={false}
        centered
        animation={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>Forgot Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="forgotPhone" className="mb-3">
            <Form.Label>Enter your phone number</Form.Label>
            <Form.Control
              type="text"
              placeholder="+254XXXXXXXXX"
              value={forgotPhone}
              onChange={(e) => setForgotPhone(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSendOtp}>
            Send OTP
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Step 2: OTP Verification Modal */}
      <Modal
        show={showOtpModal}
        onHide={() => setShowOtpModal(false)}
        backdrop="static"
        keyboard={false}
        centered
        animation={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>Verify OTP</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="enteredOtp" className="mb-3">
            <Form.Label>Enter the OTP sent to your phone</Form.Label>
            <Form.Control
              type="text"
              placeholder="OTP"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleVerifyOtp}>
            Verify OTP
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Step 3: Reset Password Modal */}
      <Modal
        show={showResetModal}
        onHide={() => setShowResetModal(false)}
        backdrop="static"
        keyboard={false}
        centered
        animation={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="newPassword" className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="confirmPassword">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleResetPassword}>
            Reset Password
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Index;
