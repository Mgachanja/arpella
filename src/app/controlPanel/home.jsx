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
import { fetchProductsAndRelated } from '../../redux/slices/productsSlice';
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
  const { user } = useSelector(state => state.auth);

  const { products, inventories, categories, subcategories, loading, error } = useSelector(
    state => state.products
  );

  const [salesCategory, setSalesCategory] = useState('All');
  const [inventoryCategory, setInventoryCategory] = useState('All');
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // dynamic greeting & clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const hour = now.getHours();
  const greet =
    hour < 12 ? 'Good morning' :
    hour < 18 ? 'Good afternoon' :
    'Good evening';
  const name = user?.firstName || user?.username || 'User';
  const timeString = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    dispatch(fetchStaffMembers());
    dispatch(fetchProductsAndRelated());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setToastMessage("Error: " + error);
      setToastVariant("danger");
      setShowToast(true);
    }
  }, [error]);

  const mergedData = products.map(prod => {
    const inv = inventories.find(item => item.productId === prod.inventoryId);
    return {
      ...prod,
      stockQuantity: inv ? inv.stockQuantity : 0,
      stockThreshold: inv ? inv.stockThreshold : 0,
      sales: prod.Sales !== undefined ? prod.Sales : prod.price * 10,
    };
  });

  const filterData = (data, selectedCategory) =>
    selectedCategory === "All"
      ? data
      : data.filter(item => Number(item.category) === Number(selectedCategory));

  const filteredSalesData = filterData(mergedData, salesCategory);
  const filteredInventoryData = filterData(mergedData, inventoryCategory);

  const salesChartData = {
    labels: filteredSalesData.map(item => item.name),
    datasets: [{
      label: 'Sales ($)',
      data: filteredSalesData.map(item => item.sales),
      backgroundColor: 'rgba(75, 192, 192, 1)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      tension: 0.1,
    }]
  };

  const stocksChartData = {
    labels: filteredInventoryData.map(item => item.name),
    datasets: [{
      label: 'Stock Quantity',
      data: filteredInventoryData.map(item => item.stockQuantity),
      backgroundColor: 'rgba(153, 102, 255, 0.5)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1,
    }]
  };

  const totalSales = filteredSalesData.reduce((acc, item) => acc + item.sales, 0);

  const lowStockItems = mergedData.filter(item =>
    item.stockThreshold && item.stockQuantity !== undefined
      ? (item.stockThreshold - item.stockQuantity) <= 6
      : false
  );
  const lowStockCount = lowStockItems.length;

  return (
    <div>
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

      {/* Floating greeting card */}
      <Container className="mt-4">
        <Card className="p-3 mb-4 shadow-sm" style={{ background: 'white' }}>
          <Row className="align-items-center">
            <Col>
              <h2 className="mb-0">{greet}, {name}</h2>
            </Col>
            <Col className="text-end">
              <h5 className="mb-0">{timeString}</h5>
            </Col>
          </Row>
        </Card>
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
            <Card
              className="p-3 text-center"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowLowStockModal(true)}
            >
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
          <Form.Select value={salesCategory} onChange={e => setSalesCategory(e.target.value)}>
            <option value="All">All</option>
            {categories.map(cat =>
              cat.categoryName && <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
            )}
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
          <Form.Select value={inventoryCategory} onChange={e => setInventoryCategory(e.target.value)}>
            <option value="All">All</option>
            {categories.map(cat =>
              cat.categoryName && <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
            )}
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
