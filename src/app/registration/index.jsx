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
import { registerUser } from '../../redux/slices/authSlice';
import { VERSION } from '../../constants';

// Import Modal, Button, Form, Tabs, and Tab from react-bootstrap for our modals
import { Modal, Button, Form, Tabs, Tab } from 'react-bootstrap';

function Registration() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
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
    dispatch(registerUser(credentials));
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
    <div className="bg-custom">
      <div className="container pb-5 pt-1">
        <h2 className="text-center font-weight-bold mb-2" style={{ fontSize: '1.75rem', fontWeight: 500 }}>
          Welcome to Arpella
        </h2>
        <div className="row justify-content-center p-4">
          {/* Left Column: Image with Full-Width App Version Ribbon */}
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
                bottom: '40px', // Raised a little bit from the bottom
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
              App Version {VERSION}
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="col-md-6">
            <h2 className="text-center mb-1" style={{ fontSize: '1.2rem', fontWeight: 400 }}>
              Create Your Account
            </h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group mb-3 text-start">
                <label>First Name:</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="First Name"
                  {...register('FirstName', { required: 'First Name is required' })}
                />
              </div>

              <div className="form-group mb-3 text-start">
                <label>Last Name:</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Last Name"
                  {...register('LastName', { required: 'Last Name is required' })}
                />
              </div>

              <div className="form-group mb-3 text-start">
                <label>Email: <small className="text-muted">(Optional)</small></label>
                <input
                  type="email"
                  className="form-control form-control-sm"
                  placeholder="Email"
                  {...register('email')}
                />
              </div>

              <div className="form-group mb-3 text-start">
                <label>Password:</label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className="form-control form-control-sm"
                    {...register('password', { required: 'Password is required', validate: validatePassword })}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <div className="form-group mb-3 text-start">
                <label>Phone Number:</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Phone Number"
                  {...register('phone', { required: 'Phone Number is required' })}
                />
              </div>

              {/* Remember Me Checkbox */}
              <div className="form-group mb-3 text-start">
                <Form.Check
                  type="checkbox"
                  label="Remember Me"
                  {...register('rememberMe')}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-sm w-100 mb-3" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Register'}
              </button>

              <span className="text-center App mb-3 d-block"> or </span>
              <div className="d-grid gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="mt-3 btn btn-outline-dark btn-sm"
                >
                  <FontAwesomeIcon icon={User} /> Already have an account? Login
                </button>
                <button type="button" className="btn btn-outline-danger btn-sm">
                  <FontAwesomeIcon icon={faGoogle} /> Login with Google
                </button>
                <button type="button" className="btn btn-outline-primary btn-sm">
                  <FontAwesomeIcon icon={faFacebook} /> Login with Facebook
                </button>
              </div>
            </form>
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
    </div>
  );
}

export default Registration;
