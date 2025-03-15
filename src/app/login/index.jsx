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

function Index() {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const dispatch = useDispatch();
  const { isAuthenticated, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Toggle state for password visibility

  useEffect(() => {
    const savedPhone = localStorage.getItem('rememberedPhone');
    const savedPassword = localStorage.getItem('rememberedPassword');

    if (savedPhone && savedPassword) {
      setValue('phone', savedPhone);
      setValue('password', savedPassword);
      setRememberMe(true);
    }
  }, [setValue]);

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

  const handleNavigate = () => {
    navigate('/');
  };

  return (
    <div className="bg-custom">
      <div className="container pb-5 pt-3">
        <div className="logo-container mb-4">
          <img src={logo} alt="Arpella logo" className="img-fluid rounded" />
        </div>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <h2 className="text-center font-weight-bold mb-2">Welcome back to Arpella</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="text-start form-group mb-3">
                <label>Phone Number:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Phone Number"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9]{9,15}$/,
                      message: 'Phone number must be 10 to 15 digits',
                    },
                  })}
                />
                {errors.phone && <small className="text-danger">{errors.phone.message}</small>}
              </div>

              {/* Password Field with Visibility Toggle */}
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

              <div className="text-start form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="rememberMe">Remember Me</label>
              </div>

              <button type="submit" className="btn btn-primary w-100 mb-3">Login</button>

              <div className="d-flex justify-content-between mb-3">
                <a href="/forgot-password">Forgot Password?</a>
              </div>
              <div className="text-center font-weight-bold mb-3"> or </div>
              <div className="d-grid gap-3">
                <button type="button" onClick={handleNavigate} className="mt-3 btn btn-outline-dark">
                  <FontAwesomeIcon icon={User} /> Don't have an account? Register
                </button>
                <button type="button" className="btn btn-outline-danger">
                  <FontAwesomeIcon icon={faGoogle} /> Login with Google
                </button>
                <button type="button" className="btn btn-outline-primary">
                  <FontAwesomeIcon icon={faFacebook} /> Login with Facebook
                </button>
              </div>
              {error && <small className="text-danger">{error}</small>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;
