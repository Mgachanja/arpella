import './App.css';
import Login from './app/login'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  return (
    <div className="App">
       <Router>
        <div>
          <ToastContainer />
          <Routes>
            <Route path="/login" element={<Login />} />  {/* Login route */}
          </Routes>
        </div>
       </Router>
    </div>
  );
}

export default App;
