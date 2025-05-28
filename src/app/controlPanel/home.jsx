import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStaffMembers, selectStaffCount } from '../../redux/slices/staffSlice';
import { fetchProductsAndRelated } from '../../redux/slices/productsSlice'; // our modified async thunk
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Modal,
  Button,
  Table,
  Toast,
  ToastContainer,
} from 'react-bootstrap';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Home = () => {
  const dispatch = useDispatch();
  const staffCount = useSelector(selectStaffCount);

  // Get products, inventories, categories, and subcategories from Redux
  const { products, inventories, categories, subcategories, loading, error } = useSelector(
    (state) => state.products
  );

  // Filter state – using category id as string; "All" means no filtering.
  const [salesCategory, setSalesCategory] = useState('All');
  const [inventoryCategory, setInventoryCategory] = useState('All');

  // Modal state for low-stock items
  const [showLowStockModal, setShowLowStockModal] = useState(false);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // Base API URL (already used in the slice)
  // const baseUrl = process.env.REACT_APP_BASE_API_URL;

  // Fetch our data on mount
  useEffect(() => {
    dispatch(fetchStaffMembers());
    dispatch(fetchProductsAndRelated());
  }, [dispatch]);

  // Show error toast if error exists
  useEffect(() => {
    if (error) {
      setToastMessage("Error: " + error);
      setToastVariant("danger");
      setShowToast(true);
    }
  }, [error]);

  // Merge products with inventories using the condition:
  // product.inventoryId === inventory.productId
  const mergedData = products.map(prod => {
    const inv = inventories.find(item => item.productId === prod.inventoryId);
    return {
      ...prod,
      stockQuantity: inv ? inv.stockQuantity : 0,
      stockThreshold: inv ? inv.stockThreshold : 0,
      // If no Sales property, simulate sales as price * 10
      sales: prod.Sales !== undefined ? prod.Sales : prod.price * 10,
    };
  });

  // Filtering helper: if filter is "All", return full data; else filter by product.category (which is a number)
  const filterData = (data, selectedCategory) => {
    if (selectedCategory === "All") return data;
    return data.filter(item => Number(item.category) === Number(selectedCategory));
  };

  const filteredSalesData = filterData(mergedData, salesCategory);
  const filteredInventoryData = filterData(mergedData, inventoryCategory);

  // Prepare chart data objects
  const salesChartData = {
    labels: filteredSalesData.map(item => item.name),
    datasets: [
      {
        label: 'Sales ($)',
        data: filteredSalesData.map(item => item.sales),
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.1,
      }
    ]
  };

  const stocksChartData = {
    labels: filteredInventoryData.map(item => item.name),
    datasets: [
      {
        label: 'Stock Quantity',
        data: filteredInventoryData.map(item => item.stockQuantity),
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      }
    ]
  };

  const totalSales = filteredSalesData.reduce((acc, item) => acc + item.sales, 0);

  // Compute low-stock items: where (stockThreshold - stockQuantity) <= 6
  const lowStockItems = mergedData.filter(item => {
    if (item.stockThreshold && item.stockQuantity !== undefined) {
      return (item.stockThreshold - item.stockQuantity) <= 6;
    }
    return false;
  });
  const lowStockCount = lowStockItems.length;

  return (
    <div>
      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg={toastVariant}
          className="text-white"
        >
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Container className="mt-4">
        <h2>Good morning, Arpella Stores</h2>
      </Container>

      {/* Stats Cards */}
      <Container className="mb-4">
        <Row className="g-3">
          <Col md={3}>
            <Card className="p-3 text-center">
              <Card.Body>
                <Card.Title>Total Sales</Card.Title>
                <Card.Text>KSH {totalSales.toFixed(2)}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="p-3 text-center" style={{ cursor: 'pointer' }} onClick={() => setShowLowStockModal(true)}>
              <Card.Body>
                <Card.Title>Low-Stock Items</Card.Title>
                <Card.Text>{lowStockCount}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="p-3 text-center">
              <Card.Body>
                <Card.Title>New Feedback Messages</Card.Title>
                <Card.Text>3</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="p-3 text-center">
              <Card.Body>
                <Card.Title>Active Staff Members</Card.Title>
                <Card.Text>{staffCount}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Sales Chart */}
      <Container className="mb-4">
        <h5>Sales Overview</h5>
        <div className="mb-3">
          <Form.Select value={salesCategory} onChange={(e) => setSalesCategory(e.target.value)}>
            <option value="All">All</option>
            {categories.map((cat) => (
              cat.categoryName && <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
            ))}
          </Form.Select>
        </div>
        <Card className="p-3">
          <Line data={salesChartData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
        </Card>
      </Container>

      {/* Stocks Chart */}
      <Container className="mb-4">
        <h5>Stocks Management</h5>
        <div className="mb-3">
          <Form.Select value={inventoryCategory} onChange={(e) => setInventoryCategory(e.target.value)}>
            <option value="All">All</option>
            {categories.map((cat) => (
              cat.categoryName && <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
            ))}
          </Form.Select>
        </div>
        <Card className="p-3">
          <Bar data={stocksChartData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
        </Card>
      </Container>

      {/* Low Stock Modal */}
      <Modal show={showLowStockModal} onHide={() => setShowLowStockModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Low Stock Items</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Inventory ID</th>
                <th>Product Name</th>
                <th>Stock Quantity</th>
                <th>Threshold</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">No low stock items</td>
                </tr>
              ) : (
                lowStockItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.inventoryId}</td>
                    <td>{item.name}</td>
                    <td>{item.stockQuantity}</td>
                    <td>{item.stockThreshold}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Home;
