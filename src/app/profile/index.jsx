import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Modal, Button, Form, Toast } from 'react-bootstrap';
import { FaPencilAlt, FaHourglass, FaTruck, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { editUserData } from '../../services/editUserData';
import Nav from '../../components/Nav';
import { toast } from 'react-toastify';

function Index() {
  const navigate = useNavigate();
  const { user, isAuthenticated, error } = useSelector((state) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleEditClick = (field, currentValue) => {
    setEditingField(field);
    setNewValue(currentValue);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      await editUserData( user.phone ,editingField, newValue);
      setShowModal(false);
      window.location.reload(); // Refresh to get updated user data
    } catch (error) {
      toast.error(error);
    }
  };

  const orders = [
    { id: 1, orderNumber: '#D245GT56', status: 'pending' },
    { id: 2, orderNumber: '#A123BC89', status: 'in transit' },
    { id: 3, orderNumber: '#Z987XY34', status: 'fulfilled' }
  ];

  const renderOrderIcon = (status) => {
    if (status === 'pending') return <FaHourglass color="blue" />;
    if (status === 'in transit') return <FaTruck color="black" />;
    if (status === 'fulfilled') return <FaCheckCircle color="green" />;
    return null;
  };

  const handleViewClick = () => {
    navigate('/Package');
  };

  return (
    <div className='h-100 pb-5'>
      <Nav />
      <Container>
        <h4 className='text-center pt-3 pb-3'>Personal Details</h4>

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

        <h5 className='text-center pt-3 pb-3'>Order History</h5>
        {orders.map((order) => (
          <Row key={order.id} className="mb-3 border-bottom pb-3 align-items-center">
            <Col xs={3}>
              <strong>Order {order.id}</strong>
              <div>{order.orderNumber}</div>
            </Col>
            <Col xs={6} className="d-flex justify-content-center">
              {order.status === 'in transit' && (
                <button
                  onClick={handleViewClick}
                  className="btn btn-link text-primary text-decoration-none"
                >
                  View
                </button>
              )}
            </Col>
            <Col xs={3} className="text-end">
              {renderOrderIcon(order.status)}
            </Col>
          </Row>
        ))}

        {/* Conditional Rendering for Admin Panel Button */}
        {user?.role !== 'Customer' && (
          <button onClick={() => navigate('/control')} className="btn btn-primary">Admin Panel</button>
        )}

        {/* Edit Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Editing {editingField}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editingField === 'PasswordHash' ? (
              <>
                <Button variant="outline-primary" className="mb-3">Request OTP</Button>
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
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit}>Submit</Button>
          </Modal.Footer>
        </Modal>

      </Container>
    </div>
  );
}

export default Index;
