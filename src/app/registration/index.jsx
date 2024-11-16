import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/boostrapCustom.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import logo from '../../assets/logo.jpeg';

function Registration() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const { error } = useSelector((state) => state.auth);

  const onSubmit = (data) => {
    console.log(data);
    // Dispatch registration action here if backend exists
  };

  const showToastError = (message) => {
    toast.error(message);
  };

  return (
    <div className=" bg-custom">
      <div className="container pb-5 pt-3">
        <div className=" logo-container mb-4">
          <img src={logo} alt="Arpella logo" className="img-fluid rounded" />
        </div>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <h2 className="text-center font-weight-bold mb-2">Register with Arpella</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="text-start form-group mb-3">
                <label>First Name:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="First Name"
                  {...register("firstName", { required: "First Name is required" })}
                />
                {errors.firstName && showToastError(errors.firstName.message)}
              </div>
              <div className="text-start form-group mb-3">
                <label>Last Name:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Last Name"
                  {...register("lastName", { required: "Last Name is required" })}
                />
                {errors.lastName && showToastError(errors.lastName.message)}
              </div>
              <div className="text-start form-group mb-3">
                <label>Email:</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && showToastError(errors.email.message)}
              </div>
              <div className="text-start form-group mb-3">
                <label>Password:</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  {...register("password", { required: "Password is required" })}
                />
                {errors.password && showToastError(errors.password.message)}
              </div>
              <div className="text-start form-group mb-3">
                <label>Phone Number:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Phone Number"
                  {...register("phone", { required: "Phone Number is required" })}
                />
                {errors.phone && showToastError(errors.phone.message)}
              </div>

              <button type="submit" className="btn btn-primary w-100 mb-3">Register</button>

              <div className="d-flex justify-content-between mb-3">
                <a href="/login">Already have an account? Login here</a>
              </div>

              <div className="d-grid gap-3">
                <button type="button" className="btn btn-outline-danger">
                  <FontAwesomeIcon icon={faGoogle} /> Register with Google
                </button>
                <button type="button" className="btn btn-outline-primary">
                  <FontAwesomeIcon icon={faFacebook} /> Register with Facebook
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
