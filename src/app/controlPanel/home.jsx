import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, BarElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { useDispatch, useSelector } from "react-redux";
import { fetchStaffMembers, selectStaffCount } from "../../redux/slices/staffSlice"; // Import Redux functions
import { products } from '../../demoData/products';

ChartJS.register(CategoryScale, LinearScale, LineElement, BarElement, PointElement, Title, Tooltip, Legend);

const Home = () => {
  const dispatch = useDispatch();
  const staffCount = useSelector(selectStaffCount); // Get staff count from Redux state
  const [salesCategory, setSalesCategory] = useState('All');
  const [inventoryCategory, setInventoryCategory] = useState('All');
  console.log(staffCount)
  useEffect(() => {
    dispatch(fetchStaffMembers()); // Fetch staff members on component mount
  }, [dispatch]);

  const categories = ['All', ...new Set(products.map((product) => product.Category))];

  const filterProducts = (category) => {
    return category === 'All' ? products : products.filter((product) => product.Category === category);
  };

  const filteredSalesProducts = filterProducts(salesCategory);
  const filteredInventoryProducts = filterProducts(inventoryCategory);

  const salesData = {
    labels: filteredSalesProducts.map((product) => product.Name),
    datasets: [
      {
        label: 'Sales ($)',
        data: filteredSalesProducts.map((product) => product.Sales),
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.1,
      },
    ],
  };

  const inventoryData = {
    labels: filteredInventoryProducts.map((product) => product.Name),
    datasets: [
      {
        label: 'Inventory Levels',
        data: filteredInventoryProducts.map((product) => product.Inventory),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const totalSales = filteredSalesProducts.reduce((acc, product) => acc + product.Sales, 0);
  const lowStockItems = filteredInventoryProducts.filter((product) => product.Inventory < 50).length;
  const newFeedback = 3;

  return (
    <div>
      <h2>Good morning, Arpella Stores</h2>

      {/* Stats Cards */}
      <div className="row g-3">
        <div className="col-md-3">
          <div className="card p-3 text-center">
            <h6>Total Sales</h6>
            <h4>KSH {totalSales.toFixed(2)}</h4>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 text-center">
            <h6>Low-Stock Items</h6>
            <h4>{lowStockItems}</h4>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 text-center">
            <h6>New Feedback Messages</h6>
            <h4>{newFeedback}</h4>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 text-center">
            <h6>Active Staff Members</h6>
            <h4>{staffCount}</h4>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="mt-4">
        <h5>Sales Overview</h5>
        <div className="mb-3">
          <select className="form-select" value={salesCategory} onChange={(e) => setSalesCategory(e.target.value)}>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="card p-3">
          <Line data={salesData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
        </div>
      </div>

      {/* Inventory Chart */}
      <div className="mt-4">
        <h5>Stocks Management</h5>
        <div className="mb-3">
          <select className="form-select" value={inventoryCategory} onChange={(e) => setInventoryCategory(e.target.value)}>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="card p-3">
          <Bar data={inventoryData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
        </div>
      </div>
    </div>
  );
};

export default Home;
