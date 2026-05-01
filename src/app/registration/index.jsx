import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/boostrapCustom.css';
import logo from '../../assets/logo.jpeg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faUser as User } from '@fortawesome/free-regular-svg-icons';
import { useNavigate } from 'react-router-dom';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useRegisterMutation } from '../../redux/api/authApi';
import { VERSION } from '../../constants';

// Import Modal, Button, Form, Tabs, and Tab from react-bootstrap for our modals
import { Modal, Button, Form, Tabs, Tab } from 'react-bootstrap';

function Registration() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading: globalIsLoading } = useSelector((state) => state.auth);
  const [registerUserApi, { isLoading: isRegistering }] = useRegisterMutation();
  const isLoading = globalIsLoading || isRegistering;
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // States for OTP and modals
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/Home');
    }
  }, [isAuthenticated, navigate]);

  const validatePassword = (value) => {
    const pattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#^_+=<>?,./|~])[A-Za-z\d@$!%*?&#^_+=<>?,./|~]{8,}$/;
    return pattern.test(value) || 'Password must have at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character';
  };

  // Simulate sending OTP – replace with your API call as needed
  const sendOtp = (data) => {
    toast.info('OTP sent to your phone and email (if provided).');
    setShowOtpModal(true);
  };

  // Simulate verifying OTP (hardcoded "123456")
  const verifyOtp = () => {
    if (phoneOtp !== '123456') {
      toast.error('Phone OTP is incorrect.');
      return;
    }
    if (formData.email && emailOtp !== '123456') {
      toast.error('Email OTP is incorrect.');
      return;
    }
    setShowOtpModal(false);
    const credentials = {
      firstName: formData.FirstName,
      lastName: formData.LastName,
      email: formData.email,
      phoneNumber: formData.phone,
      passwordHash: formData.password,
    };
    registerUserApi(credentials).unwrap().catch(() => {});
  };

  const onSubmit = (data) => {
    // "rememberMe" will be either true or false depending on the checkbox.
    if (!data.email) {
      toast.info('Email is optional. You can leave it blank if you wish.');
    }
    setFormData(data);
    setShowTermsModal(true);
  };

  const handleTermsSubmit = () => {
    if (!agreedTerms) {
      toast.error('You must agree to the Terms and Conditions to continue.');
      return;
    }
    setShowTermsModal(false);
    sendOtp(formData);
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
              <span className="badge border border-light rounded-pill px-4 py-2 fw-semibold" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>App Version {VERSION}</span>
            </div>
          </div>

          {/* Right: Registration form */}
          <div className="col-md-6 d-flex flex-column justify-content-center align-items-center p-4 p-md-5 position-relative" style={{ overflowY: 'auto' }}>
            <div className="w-100" style={{ maxWidth: '460px', marginTop: 'auto', marginBottom: 'auto' }}>
              <div className="text-center mb-4">
                <div className="d-md-none mb-3">
                  <img src={logo} alt="Arpella Logo" className="rounded-circle shadow-sm" style={{ width: '70px', height: '70px', objectFit: 'cover' }} />
                </div>
                <h2 className="fw-bolder" style={{ color: '#1a1d20' }}>Create Account</h2>
                <p className="text-secondary fw-medium">Join Arpella today. It's free and easy.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-3 mb-3">
                  <div className="col-sm-6 text-start">
                    <label className="form-label fw-bold text-secondary small text-uppercase">First Name</label>
                    <input
                      type="text"
                      className={`form-control border-0 bg-light ${errors.FirstName ? 'is-invalid' : ''}`}
                      placeholder="John"
                      style={{ borderRadius: '0.75rem', padding: '0.75rem 1rem' }}
                      {...register('FirstName', { required: 'First Name is required' })}
                    />
                    {errors.FirstName && <small className="text-danger mt-1 d-block fw-semibold">{errors.FirstName.message}</small>}
                  </div>

                  <div className="col-sm-6 text-start">
                    <label className="form-label fw-bold text-secondary small text-uppercase">Last Name</label>
                    <input
                      type="text"
                      className={`form-control border-0 bg-light ${errors.LastName ? 'is-invalid' : ''}`}
                      placeholder="Doe"
                      style={{ borderRadius: '0.75rem', padding: '0.75rem 1rem' }}
                      {...register('LastName', { required: 'Last Name is required' })}
                    />
                    {errors.LastName && <small className="text-danger mt-1 d-block fw-semibold">{errors.LastName.message}</small>}
                  </div>
                </div>

                <div className="mb-3 text-start">
                  <label className="form-label fw-bold text-secondary small text-uppercase">Phone Number</label>
                  <input
                    type="text"
                    className={`form-control border-0 bg-light ${errors.phone ? 'is-invalid' : ''}`}
                    placeholder="254XXXXXXXX"
                    style={{ borderRadius: '0.75rem', padding: '0.75rem 1rem' }}
                    {...register('phone', { required: 'Phone Number is required' })}
                  />
                  {errors.phone && <small className="text-danger mt-1 d-block fw-semibold">{errors.phone.message}</small>}
                </div>

                <div className="mb-3 text-start">
                  <label className="form-label fw-bold text-secondary small text-uppercase">Email <small className="text-muted text-lowercase fw-normal">(Optional)</small></label>
                  <input
                    type="email"
                    className="form-control border-0 bg-light"
                    placeholder="john@example.com"
                    style={{ borderRadius: '0.75rem', padding: '0.75rem 1rem' }}
                    {...register('email')}
                  />
                </div>

                <div className="mb-3 text-start">
                  <label className="form-label fw-bold text-secondary small text-uppercase mb-1">Password</label>
                  <div className={`d-flex bg-light align-items-center ${errors.password ? 'border border-danger' : 'border-0'}`} style={{ borderRadius: '0.75rem', overflow: 'hidden' }}>  
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="form-control border-0 bg-transparent shadow-none"
                      style={{ padding: '0.75rem 1rem' }}
                      {...register('password', { required: 'Password is required', validate: validatePassword })}
                    />
                    <button
                      type="button"
                      className="btn border-0 shadow-none text-secondary px-3"
                      onClick={() => setShowPassword(s => !s)}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  {errors.password && <small className="text-danger mt-1 d-block fw-semibold">{errors.password.message}</small>}
                </div>

                {/* Remember Me */}
                <div className="form-group mb-4 text-start">
                  <Form.Check
                    type="checkbox"
                    id="rememberMeReg"
                    label={<span className="text-secondary fw-medium">Remember me</span>}
                    {...register('rememberMe')}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-100 mb-4 fw-bold shadow-sm" disabled={isLoading} style={{ borderRadius: '0.75rem', padding: '0.85rem' }}>
                  {isLoading ? 'Registering...' : 'Register'}
                </button>

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
                  <span className="text-secondary fw-medium">Already have an account? </span>
                  <span 
                    className="text-primary fw-bold" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      <Modal
        show={showTermsModal}
        onHide={() => setShowTermsModal(false)}
        backdrop="static"
        keyboard={false}
        centered
        animation={true}
        dialogClassName="wide-modal"  // Use custom CSS to ensure the modal is wide
      >
        <Modal.Header>
          <Modal.Title>Terms and Conditions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Minimalistic Navigation with Tabs */}
          <Tabs defaultActiveKey="privacy" id="tandc-tabs" className="mb-3" style={{ whiteSpace: 'nowrap' }}>
            <Tab eventKey="privacy" title="Privacy Policy">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam suscipit, sapien ut placerat ultricies, lorem metus elementum nulla, eget lobortis odio ipsum nec neque.
              </p>
            </Tab>
            <Tab eventKey="conduct" title="Code of Conduct">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet ligula eget urna interdum tristique. Fusce nec dignissim lorem.
              </p>
            </Tab>
            <Tab eventKey="return" title="Return Policy">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sit amet orci nec risus fermentum varius.
              </p>
            </Tab>
            <Tab eventKey="delivery" title="Delivery Policies">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent nec diam vel eros elementum cursus.
              </p>
            </Tab>
          </Tabs>
          <Form>
            <Form.Group controlId="termsCheckbox">
              <Form.Check 
                type="checkbox"
                label="I agree to the Terms and Conditions"
                onChange={(e) => setAgreedTerms(e.target.checked)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleTermsSubmit} disabled={!agreedTerms}>
            Proceed
          </Button>
        </Modal.Footer>
      </Modal>

      {/* OTP Verification Modal */}
      <Modal
        show={showOtpModal}
        onHide={() => {}}
        backdrop="static"
        keyboard={false}
        centered
        animation={true}
      >
        <Modal.Header>
          <Modal.Title>OTP Verification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="phoneOtp">
              <Form.Label>Enter OTP sent to your phone</Form.Label>
              <Form.Control
                type="text"
                placeholder="Phone OTP"
                className="form-control form-control-sm"
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value)}
              />
            </Form.Group>
            {formData && formData.email && (
              <Form.Group className="mb-3" controlId="emailOtp">
                <Form.Label>Enter OTP sent to your email</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Email OTP"
                  className="form-control form-control-sm"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => toast.info('Resending OTP...')}>
            Resend OTP
          </Button>
          <Button variant="primary" size="sm" onClick={verifyOtp}>
            Verify OTP
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Registration;
