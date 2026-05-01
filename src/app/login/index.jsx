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
import { useLoginMutation } from '../../redux/api/authApi';
import { toast } from 'react-toastify';
import { Modal, Button, Form } from 'react-bootstrap';
import { persistor } from '../../redux/store';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // React‑Hook‑Form setup
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  // Redux auth state
  const { isAuthenticated, user, error: globalError } = useSelector(state => state.auth);
  const [loginUserApi, { isLoading, error: rtkError }] = useLoginMutation();
  const rawError = rtkError?.data || rtkError?.error || globalError;
  const error = typeof rawError === 'object' && rawError !== null 
    ? (rawError.detail || rawError.message || JSON.stringify(rawError)) 
    : rawError;

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
  const onSubmit = async data => {
    try {
      await loginUserApi({ username: data.phone, password: data.password }).unwrap();
    } catch (err) {
      // Errors handled gracefully by RTK Query / authSlice matchers
    }
  };

  // After auth success: enforce Remember‑Me policy and navigate
  useEffect(() => {
    if (!isAuthenticated) return;

    // If staff checked Remember Me, revoke and warn
    if (rememberMe && (user?.roles?.[0] || user?.role) !== 'Customer') {
      toast.warning('Staff members are not granted the Remember Me feature');
      localStorage.removeItem('rememberedPhone');
      localStorage.removeItem('rememberedPassword');
    }

    // If customer and opted in, persist credentials
    if (rememberMe && (user?.roles?.[0] || user?.role) === 'Customer') {
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
    <>
      <div className="container-fluid vh-100 p-0 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f0f2f5' }}>
        <div className="row g-0 w-100 h-100 shadow-lg rounded-0 overflow-hidden bg-white">
          {/* Left: Logo + Version ribbon */}
          <div className="col-md-6 d-none d-md-block position-relative">
            <img
              src={logo}
              alt="Arpella logo"
              className="w-100 h-100"
              style={{ objectFit: 'cover' }}
            />
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)' }}></div>
            <div
              className="position-absolute w-100 text-center"
              style={{ bottom: '50px', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
            >
              <h1 className="fw-bolder mb-2" style={{ letterSpacing: '3px' }}>ARPELLA</h1>
              <span className="badge border border-light rounded-pill px-4 py-2 fw-semibold" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>App Version 0.0.4</span>
            </div>
          </div>

          {/* Right: Login form */}
          <div className="col-md-6 d-flex flex-column justify-content-center align-items-center p-4 p-md-5 position-relative">
            <div className="w-100" style={{ maxWidth: '420px' }}>
              <div className="text-center mb-5">
                <div className="d-md-none mb-4">
                  <img src={logo} alt="Arpella Logo" className="rounded-circle shadow-sm" style={{ width: '90px', height: '90px', objectFit: 'cover' }} />
                </div>
                <h2 className="fw-bolder" style={{ color: '#1a1d20' }}>Welcome Back</h2>
                <p className="text-secondary fw-medium">Please enter your details to sign in.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Phone */}
                <div className="mb-4 text-start">
                  <label className="form-label fw-bold text-secondary small text-uppercase">Phone Number</label>
                  <input
                    name="phone"
                    type="text"
                    className={`form-control form-control-lg border-0 bg-light ${errors.phone ? 'is-invalid' : ''}`}
                    placeholder="254XXXXXXXX"
                    style={{ borderRadius: '0.75rem', padding: '0.85rem 1rem' }}
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^254[0-9]{9}$/,
                        message: 'Must start with 254 and have 8 digits',
                      },
                    })}
                  />
                  {errors.phone && (
                    <small className="text-danger mt-1 d-block fw-semibold">
                      {errors.phone.message}
                    </small>
                  )}
                </div>

                {/* Password */}
                <div className="mb-4 text-start">
                  <div className="d-flex justify-content-between align-items-end mb-1">
                    <label className="form-label fw-bold text-secondary small text-uppercase mb-0">Password</label>
                    <small
                      className="text-primary fw-bold"
                      style={{ cursor: 'pointer', textDecoration: 'none' }}
                      onClick={() => {
                        setForgotPhone('254');
                        setShowForgotModal(true);
                      }}
                    >
                      Forgot Password?
                    </small>
                  </div>
                  <div className={`d-flex bg-light align-items-center ${errors.password ? 'border border-danger' : 'border-0'}`} style={{ borderRadius: '0.75rem', overflow: 'hidden' }}>  
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="form-control form-control-lg border-0 bg-transparent shadow-none"
                      style={{ padding: '0.85rem 1rem' }}
                      {...register('password', {
                        required: 'Password is required',
                      })}
                    />
                    <button
                      type="button"
                      className="btn border-0 shadow-none text-secondary px-3"
                      onClick={() => setShowPassword(s => !s)}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  {errors.password && (
                    <small className="text-danger mt-1 d-block fw-semibold">
                      {errors.password.message}
                    </small>
                  )}
                </div>

                {/* Remember Me */}
                <div className="form-group mb-4 text-start">
                  <Form.Check
                    type="checkbox"
                    id="rememberMe"
                    label={<span className="text-secondary fw-medium">Remember me</span>}
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                  />
                </div>

                {/* Submit */}
                <button type="submit" className="btn btn-primary btn-lg w-100 mb-4 fw-bold shadow-sm" style={{ borderRadius: '0.75rem', padding: '0.85rem' }}>
                  {isLoading ? 'Logging in...' : 'Sign In'}
                </button>

                {/* Alternative actions */}
                <div className="position-relative mb-4 text-center">
                  <hr className="text-muted" />
                  <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small fw-bold text-uppercase">
                    or continue with
                  </span>
                </div>

                <div className="d-flex gap-3 mb-4">
                  <Button variant="outline-danger" className="w-50 rounded-pill py-2 fw-semibold border-2 d-flex align-items-center justify-content-center gap-2">
                    <FontAwesomeIcon icon={faGoogle} /> Google
                  </Button>
                  <Button variant="outline-primary" className="w-50 rounded-pill py-2 fw-semibold border-2 d-flex align-items-center justify-content-center gap-2">
                    <FontAwesomeIcon icon={faFacebook} /> Facebook
                  </Button>
                </div>

                <div className="text-center">
                  <span className="text-secondary fw-medium">Don't have an account? </span>
                  <span 
                    className="text-primary fw-bold" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/')}
                  >
                    Create one
                  </span>
                </div>

                {error && (
                  <div className="alert alert-danger mt-4 text-center border-0" style={{ borderRadius: '0.5rem' }}>
                    <small className="fw-semibold">{error}</small>
                  </div>
                )}
              </form>
            </div>
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
    </>
  );
}

export default Login;
