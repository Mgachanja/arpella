import React, { useEffect,useState } from 'react';
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

function Registration() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/Home');
    }
  }, [isAuthenticated, navigate]);

  const validatePassword = (value) => {
    const pattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#^_+=<>?,./|~])[A-Za-z\d@$!%*?&#^_+=<>?,./|~]{8,}$/;
    return pattern.test(value) || 'Password must have at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character';
  };

  const onSubmit = async (data) => {
    const credentials = {
      FirstName:data.FirstName,
      LastName:data.LastName,
      email:data.email,
      PhoneNumber: data.phone,
      passwordHash: data.password,
    };
    dispatch(registerUser(credentials))
  };

  const handleNavigate = () => {
    navigate('/login');
  };

  return (
    <div className="bg-custom">
      <div className="container pb-5 pt-3">
        <h2 className="text-center font-weight-bold mb-2">Welcome to Arpella</h2>
        <div className="logo-container mb-4">
          <img src={logo} alt="Arpella logo" className="img-fluid rounded" />
        </div>
        <div className="row justify-content-center p-5">
          <div className="col-md-6">
            <h2 className="text-center mb-1">Create Your Account</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group mb-3 text-start">
                <label>First Name:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="First Name"
                  {...register('FirstName', { required: 'First Name is required' })}
                />
                {errors.FirstName && <small className="text-danger">{errors.FirstName.message}</small>}
              </div>

              <div className="form-group mb-3 text-start">
                <label>Last Name:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Last Name"
                  {...register('LastName', { required: 'Last Name is required' })}
                />
                {errors.LastName && <small className="text-danger">{errors.LastName.message}</small>}
              </div>

              <div className="form-group mb-3 text-start">
                <label>Email:</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <small className="text-danger">{errors.email.message}</small>}
              </div>

                          <div className="text-start form-group mb-3 position-relative">
                            <label>Password:</label>
                            <div className="input-group">
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
                          </div>

              <div className="form-group mb-3 text-start">
                <label>Phone Number:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Phone Number"
                  {...register('phone', { required: 'Phone Number is required' })}
                />
                {errors.phone && <small className="text-danger">{errors.phone.message}</small>}
              </div>

              <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>

              <span className="text-center App mb-3"> or </span>
              <div className="d-grid gap-3">
                <button type="button" onClick={handleNavigate} className="mt-3 btn btn-outline-dark">
                  <FontAwesomeIcon icon={User} /> Already have an account? Login
                </button>
                <button type="button" className="btn btn-outline-danger">
                  <FontAwesomeIcon icon={faGoogle} /> Login with Google
                </button>
                <button type="button" className="btn btn-outline-primary">
                  <FontAwesomeIcon icon={faFacebook} /> Login with Facebook
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registration;
