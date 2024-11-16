import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { login } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/boostrapCustom.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons'
import logo from '../../assets/logo.jpeg'

function Index() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const { isAuthenticated, error } = useSelector((state) => state.auth);

  const onSubmit = (data) => {
    dispatch(login(data));
  };

  const showToastError = (message) => {
    toast.error(message);
  };

  const showToastSuccess = (message) => {
    toast.success(message);
  };

  return (
    <div className=" bg-custom">
    <div className="container pb-5 pt-3">
    <div className=" logo-container mb-4">
            <img src={logo} alt="Arpella logo" className="img-fluid rounded" />
          </div>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center font-weight-bold mb-2">Welcome back to Arpella</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className=" text-start form-group mb-3">
              <label>Email:</label>
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                style={{"::placeholder": { color: "rgb(255, 234, 222)", opacity: 1 }}}
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && showToastError(errors.email.message)}
            </div>
            
            <div className=" text-start form-group mb-3">
              <label>Password:</label>
              <input
                type="password"
                placeholder="Password"
                className="form-control"
                style={{"::placeholder": { color: "rgb(255, 234, 222)", opacity: 1 }}}

                {...register("password", { required: "Password is required" })}
              />
              {errors.password && showToastError(errors.password.message)}
            </div>
            
            <div className="text-start form-check mb-3">
              <input type="checkbox" className="form-check-input" {...register("rememberMe")} />
              <label className="form-check-label">Remember Me</label>
            </div>

            <button type="submit" className="btn btn-primary w-100 mb-3">Login</button>

            <div className="d-flex justify-content-between mb-3">
              <a href="/forgot-password">Forgot Password?</a> 
            </div>

            <div className="d-grid gap-3">
              <button type="button" className="btn btn-outline-danger">
              <FontAwesomeIcon icon={faGoogle} /> Login with Google
              </button>
              <button type="button" className="btn btn-outline-primary">
              <FontAwesomeIcon icon={faFacebook} /> Login with Facebook
              </button>
            </div>
            {//isAuthenticated && showToastSuccess('Login successful')
            }
            {error && showToastError(error)}
          </form>
        </div>
      </div>
    </div>
    </div>
  )
}

export default Index
