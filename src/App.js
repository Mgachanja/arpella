import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store";
import Login from "./app/login";
import Home from "./app/Home";
import Registration from "./app/registration";
import Cart from "./app/Cart";
import Profile from "./app/profile";
import ControlPanel from "./app/controlPanel";
import Package from "./app/profile/Package";
import ProtectedRoute from "./app/ProtectedRoute";
import LoadingSpinner from "../src/components/LoadingSpinner"

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <div className="bg-custom">
          <Router>
            <div>
              <ToastContainer />
              <LoadingSpinner /> {/* Show loader when isLoading is true */}
              <Routes>
                <Route path="/" element={<Registration />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/control" element={<ProtectedRoute><ControlPanel /></ProtectedRoute>} />
                <Route path="/package" element={<ProtectedRoute><Package /></ProtectedRoute>} />
              </Routes>
            </div>
          </Router>
        </div>
      </PersistGate>
    </Provider>
  );
}

export default App;
