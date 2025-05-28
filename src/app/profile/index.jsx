import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Modal, Button, Form, Spinner } from 'react-bootstrap';
import { FaPencilAlt, FaHourglass, FaTruck, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { editUserData } from '../../services/editUserData';
import Nav from '../../components/Nav';
import { toast } from 'react-toastify';
import axios from 'axios';
import { baseUrl } from '../../constants';

function Index() {
  const navigate = useNavigate();
  const { user, isAuthenticated, error } = useSelector((state) => state.auth);
  const products = useSelector((state) => state.products.products);
  
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingField, setEditingField] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isApiLoading, setIsApiLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsApiLoading(true);
      try {
        const response = await axios.get(`${baseUrl}/orders`);
        console.log('Fetched Orders:', response.data);
        const userOrders = response.data.filter(order => order.userId === user?.phone);
        console.log('User Orders:', userOrders);
        setOrders(userOrders);
      } catch (err) {
        toast.error('Failed to fetch orders.');
        console.error('Error fetching orders:', err);
      } finally {
        setIsApiLoading(false);
      }
    };
    if (user?.phone) {
      fetchOrders();
    }
  }, [user]);

  const handleEditClick = (field, currentValue) => {
    setEditingField(field);
    setNewValue(currentValue);
    setShowEditModal(true);
  };

  const handleSubmit = async () => {
    setIsApiLoading(true);
    try {
      await editUserData(user.phone, editingField, newValue);
      setShowEditModal(false);
      window.location.reload();
    } catch (error) {
      toast.error(error);
    } finally {
      setIsApiLoading(false);
    }
  };

  const renderOrderIcon = (status) => {
    if (status.toLowerCase() === 'pending') return <FaHourglass color="blue" />;
    if (status.toLowerCase() === 'in transit') return <FaTruck color="black" />;
    if (status.toLowerCase() === 'fulfilled') return <FaCheckCircle color="green" />;
    return null;
  };

  const handleOrderClick = (order) => {
    console.log('Selected Order:', order);
    setSelectedOrder(order);
  };

  const handleCloseOrderModal = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="h-100 pb-5">
      <Nav />
      <Container>
        <h4 className="text-center pt-3 pb-3">Personal Details</h4>
        {isAuthenticated ? (
          <>
            <Row className="mb-3">
              <Col xs={5}><strong>First Name:</strong></Col>
              <Col xs={5}>{user?.firstName || 'N/A'}</Col>
              <Col xs={2} className="text-end">
                <FaPencilAlt onClick={() => handleEditClick('firstName', user?.firstName)} style={{ cursor: 'pointer' }} />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={5}><strong>Last Name:</strong></Col>
              <Col xs={5}>{user?.lastName || 'N/A'}</Col>
              <Col xs={2} className="text-end">
                <FaPencilAlt onClick={() => handleEditClick('lastName', user?.lastName)} style={{ cursor: 'pointer' }} />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={5}><strong>Email:</strong></Col>
              <Col xs={5}>{user?.email || 'N/A'}</Col>
              <Col xs={2} className="text-end">
                <FaPencilAlt onClick={() => handleEditClick('email', user?.email)} style={{ cursor: 'pointer' }} />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={5}><strong>Phone:</strong></Col>
              <Col xs={5}>{user?.phone || 'N/A'}</Col>
              <Col xs={2} className="text-end">
                <FaPencilAlt onClick={() => handleEditClick('PhoneNumber', user?.phone)} style={{ cursor: 'pointer' }} />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={5}><strong>Password:</strong></Col>
              <Col xs={5}>**********</Col>
              <Col xs={2} className="text-end">
                <FaPencilAlt onClick={() => handleEditClick('password', '')} style={{ cursor: 'pointer' }} />
              </Col>
            </Row>
          </>
        ) : (
          <p className="text-center">No user data available. Please log in.</p>
        )}
        {error && <p className="text-danger text-center">{error}</p>}

        <h5 className="text-center pt-3 pb-3">Order History</h5>
        {orders.length === 0 ? (
          <p className="text-center">No orders found.</p>
        ) : (
          orders.map((order) => (
            <Row
              key={order?.orderid || Math.random()}
              className="mb-3 border-bottom pb-3 align-items-center"
              style={{ cursor: 'pointer' }}
              onClick={() => handleOrderClick(order)}
            >
              <Col xs={3}>
                <strong>
                  ORDER {order?.orderid ? order.orderid.toUpperCase() : 'N/A'}
                </strong>
                <div>{order.status || 'N/A'}</div>
              </Col>
              <Col xs={6} className="d-flex justify-content-center">
                <Button variant="link" className="text-primary text-decoration-none">
                  View Details
                </Button>
              </Col>
              <Col xs={3} className="text-end">
                {renderOrderIcon(order.status)}
              </Col>
            </Row>
          ))
        )}

        {user?.role !== 'Customer' && (
          <Button onClick={() => navigate('/control')} className="btn btn-primary">
            Admin Panel
          </Button>
        )}

        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Editing {editingField}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editingField === 'PasswordHash' ? (
              <>
                <Button variant="outline-primary" className="mb-3">
                  Request OTP
                </Button>
                <Form.Group controlId="newPassword">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter new password"
                    onChange={(e) => setNewValue(e.target.value)}
                  />
                </Form.Group>
              </>
            ) : (
              <Form.Group controlId="newValue">
                <Form.Label>New {editingField}</Form.Label>
                <Form.Control
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={!!selectedOrder} onHide={handleCloseOrderModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              Order Details - ORDER {selectedOrder?.orderid ? selectedOrder.orderid.toUpperCase() : 'N/A'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder &&
            Array.isArray(selectedOrder.orderItems) &&
            selectedOrder.orderItems.length > 0 ? (
              selectedOrder.orderItems.map((item, index) => {
                const product = products.find((prod) => prod.id === item.productId);
                return (
                  <Row key={index} className="mb-3 align-items-center">
                    <Col xs={3}>
                      {product?.productImage ? (
                        <img
                          src={product.productImage}
                          alt={product.name}
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#ccc' }}></div>
                      )}
                    </Col>
                    <Col xs={6}>
                      <h6>{product?.name || 'Unnamed Product'}</h6>
                      <p>
                        Price: KSH {product?.price ? parseFloat(product.price).toFixed(2) : 'N/A'}
                      </p>
                    </Col>
                    <Col xs={3}>
                      <p>Qty: {item.quantity}</p>
                    </Col>
                  </Row>
                );
              })
            ) : (
              <p className="text-center text-muted">No products found in this order.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseOrderModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>

      <Modal show={isApiLoading} centered backdrop="static" keyboard={false}>
        <Modal.Body className="text-center">
          <Spinner animation="border" role="status" />
          <p className="mt-3">Fetching your orders...</p>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Index;
