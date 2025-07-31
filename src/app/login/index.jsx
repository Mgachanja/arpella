// src/pages/Login/Index.js

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
import { persistor } from '../../redux/store';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // React‑Hook‑Form setup
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  // Redux auth state
  const { isAuthenticated, isLoading, error, user } = useSelector(state => state.auth);

  // Local UI state
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot‑password flow state
  const [showForgotModal, setShowForgotModal]   = useState(false);
  const [showOtpModal, setShowOtpModal]         = useState(false);
  const [showResetModal, setShowResetModal]     = useState(false);
  const [forgotPhone, setForgotPhone]           = useState('254');
  const [enteredOtp, setEnteredOtp]             = useState('');
  const [newPassword, setNewPassword]           = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');

  // On mount: prefill phone/password if saved
  useEffect(() => {
    const savedPhone    = localStorage.getItem('rememberedPhone');
    const savedPassword = localStorage.getItem('rememberedPassword');

    if (savedPhone && savedPassword) {
      setValue('phone', savedPhone);
      setValue('password', savedPassword);
      setRememberMe(true);
    } else {
      setValue('phone', '254');
    }
  }, [setValue]);

  // Dispatch login action
  const onSubmit = data => {
    dispatch(loginUser({ username: data.phone, password: data.password }));
  };

  // After auth success: enforce Remember‑Me policy and navigate
  useEffect(() => {
    if (!isAuthenticated) return;

    // If staff checked Remember Me, revoke and warn
    if (rememberMe && user?.role !== 'Customer') {
      toast.warning('Staff members are not granted the Remember Me feature');
      localStorage.removeItem('rememberedPhone');
      localStorage.removeItem('rememberedPassword');
    }

    // If customer and opted in, persist credentials
    if (rememberMe && user?.role === 'Customer') {
      const phoneInput    = document.querySelector('input[name="phone"]')?.value;
      const passwordInput = document.querySelector('input[name="password"]')?.value;
      localStorage.setItem('rememberedPhone', phoneInput);
      localStorage.setItem('rememberedPassword', passwordInput);
    }

    // Redirect to Home
    navigate('/Home', { replace: true });
  }, [isAuthenticated, user, rememberMe, navigate]);

  // ----- Forgot Password Handlers -----

  const handleSendOtp = () => {
    if (!/^254[0-9]{8}$/.test(forgotPhone)) {
      toast.error('Phone must start with 254 followed by exactly 8 digits');
      return;
    }
    toast.info(`OTP sent to ${forgotPhone}`);
    setShowForgotModal(false);
    setShowOtpModal(true);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp !== '123456') {
      toast.error('Incorrect OTP.');
      return;
    }
    toast.success('OTP verified!');
    setShowOtpModal(false);
    setShowResetModal(true);
  };

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
    setEnteredOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="bg-custom">
      <div className="container pb-5 pt-3">
        <div className="row">
          {/* Left: Logo + Version ribbon */}
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
                bottom: 40,
                left: 0,
                width: '100%',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: '#fff',
                textAlign: 'center',
                padding: '8px 0',
                fontWeight: 'bold',
              }}
            >
              App Version 0.0.4
            </div>
          </div>

          {/* Right: Login form */}
          <div className="col-md-6">
            <h2 className="text-center font-weight-bold mb-2">
              Welcome back to Arpella
            </h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Phone */}
              <div className="form-group mb-3 text-start">
                <label>Phone Number:</label>
                <input
                  name="phone"
                  type="text"
                  className="form-control"
                  placeholder="254XXXXXXXX"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^254[0-9]{9}$/,
                      message: 'Must start with 254 and have 8 digits',
                    },
                  })}
                />
                {errors.phone && (
                  <small className="text-danger">
                    {errors.phone.message}
                  </small>
                )}
              </div>

              {/* Password + Forgot link */}
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="mb-0">Password:</label>
                <small
                  style={{ cursor: 'pointer', fontWeight: 'bold' }}
                  onClick={() => {
                    setForgotPhone('254');
                    setShowForgotModal(true);
                  }}
                >
                  Forgot Password?
                </small>
              </div>

              {/* Password input + toggle */}
              <div className="input-group mb-3">  
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="form-control"
                  {...register('password', {
                    required: 'Password is required',
                  })}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(s => !s)}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {errors.password && (
                <small className="text-danger">
                  {errors.password.message}
                </small>
              )}

              {/* Remember Me */}
              <div className="form-group mb-3 text-start">
                <Form.Check
                  type="checkbox"
                  id="rememberMe"
                  label="Remember Me"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
              </div>

              {/* Submit */}
              <button type="submit" className="btn btn-primary w-100 mb-3">
                {isLoading ? 'Logging in...' : 'Login'}
              </button>

              {/* Alternative actions */}
              <div className="text-center font-weight-bold mb-3">or</div>
              <div className="d-grid gap-3">
                <Button variant="outline-dark" onClick={() => navigate('/')}>
                  <FontAwesomeIcon icon={User} /> Don’t have an account? Register
                </Button>
                <Button variant="outline-danger">
                  <FontAwesomeIcon icon={faGoogle} /> Login with Google
                </Button>
                <Button variant="outline-primary">
                  <FontAwesomeIcon icon={faFacebook} /> Login with Facebook
                </Button>
              </div>

              {error && (
                <small className="text-danger d-block text-center mt-2">
                  {error}
                </small>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Forgot Password Modals */}
      <Modal show={showForgotModal} onHide={() => setShowForgotModal(false)} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton><Modal.Title>Forgot Password</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group controlId="forgotPhone">
            <Form.Label>Enter your phone number</Form.Label>
            <Form.Control type="text" value={forgotPhone} onChange={e => setForgotPhone(e.target.value)} placeholder="254XXXXXXXX" />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer><Button onClick={handleSendOtp}>Send OTP</Button></Modal.Footer>
      </Modal>

      <Modal show={showOtpModal} onHide={() => setShowOtpModal(false)} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton><Modal.Title>Verify OTP</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group controlId="enteredOtp">
            <Form.Label>Enter the OTP sent to your phone</Form.Label>
            <Form.Control type="text" value={enteredOtp} onChange={e => setEnteredOtp(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer><Button onClick={handleVerifyOtp}>Verify OTP</Button></Modal.Footer>
      </Modal>

      <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton><Modal.Title>Reset Password</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group controlId="newPassword" className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </Form.Group>
          <Form.Group controlId="confirmPassword">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer><Button onClick={handleResetPassword}>Reset Password</Button></Modal.Footer>
      </Modal>
    </div>
  );
}

export default Login;
