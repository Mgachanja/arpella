import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { register as registerUser } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/boostrapCustom.css';
import logo from '../../assets/logo.jpeg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faUser as User } from '@fortawesome/free-regular-svg-icons';
import { useNavigate } from 'react-router-dom';

function Registration() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const { isAuthenticated, error, loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/Home');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  const handleNavigate = () => {
    navigate('/login');
  };

  const showToastError = (message) => {
    toast.error(message);
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
                  {...register("firstName", { required: "First Name is required" })}
                />
                {errors.firstName && showToastError(errors.firstName.message)}
              </div>

              <div className="form-group mb-3 text-start">
                <label>Last Name:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Last Name"
                  {...register("lastName", { required: "Last Name is required" })}
                />
                {errors.lastName && showToastError(errors.lastName.message)}
              </div>

              <div className="form-group mb-3 text-start">
                <label>Email:</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && showToastError(errors.email.message)}
              </div>

              <div className="form-group mb-3 text-start">
                <label>Password:</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  {...register("password", { required: "Password is required" })}
                />
                {errors.password && showToastError(errors.password.message)}
              </div>

              <div className="form-group mb-3 text-start">
                <label>Phone Number:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Phone Number"
                  {...register("phone", { required: "Phone Number is required" })}
                />
                {errors.phone && showToastError(errors.phone.message)}
              </div>

              <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>

              <span className='text-center App mb-3'> or </span>
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

              {error && showToastError(error)}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registration;
