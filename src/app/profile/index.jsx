// src/pages/Profile/Index.js
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Container,
  Card,
  Row,
  Col,
  Modal,
  Button,
  Form,
  Spinner,
} from "react-bootstrap";
import {
  FaPencilAlt,
  FaHourglass,
  FaTruck,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import Nav from "../../components/Nav";
import { baseUrl } from "../../constants";

import { logout } from "../../redux/slices/authSlice";
import { persistor } from "../../redux/store";

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Auth + Products from Redux
  const { user, isAuthenticated, error } = useSelector((s) => s.auth);
  const products = useSelector((s) => s.products.products || []);

  // Local UI state
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingField, setEditingField] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isApiLoading, setIsApiLoading] = useState(false);

  // Fetch current user orders
  useEffect(() => {
    if (!user?.phone) return;
    setIsApiLoading(true);
    axios
      .get(`${baseUrl}/orders`)
      .then(({ data }) => {
        // Expecting array; filter by user phone (userId in orders)
        const arr = Array.isArray(data) ? data : [];
        setOrders(arr.filter((o) => o.userId === user.phone || o.userId === user.phoneNumber));
      })
      .catch(() => toast.error("Failed to fetch orders."))
      .finally(() => setIsApiLoading(false));
  }, [user]);

  // Purge persisted state, dispatch logout, redirect
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, log me out",
    });
    if (!result.isConfirmed) return;

    // Purge storage and Redux auth
    await persistor.purge();
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const handleEditClick = (field, value) => {
    setEditingField(field);
    setNewValue(value || "");
    setShowEditModal(true);
  };

  const handleSubmit = async () => {
    const payload = {
      email: editingField === "email" ? newValue : user.email,
      passwordHash: editingField === "passwordHash" ? newValue : user.passwordHash || "",
      phoneNumber: user.phone,
      firstName: editingField === "firstName" ? newValue : user.firstName,
      lastName: editingField === "lastName" ? newValue : user.lastName,
    };

    const confirm = await Swal.fire({
      title: `Update ${editingField}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      reverseButtons: true,
    });
    if (!confirm.isConfirmed) return;

    setIsApiLoading(true);
    try {
      await axios.put(`${baseUrl}/user-details/${user.phone}`, payload);
      await Swal.fire("Saved!", "", "success");
      window.location.reload();
    } catch (e) {
      Swal.fire("Error", e?.response?.data?.message || "Failed", "error");
    } finally {
      setIsApiLoading(false);
      setShowEditModal(false);
    }
  };

  const renderIcon = (status) => {
    const st = (status || "").toLowerCase();
    if (st === "pending") return <FaHourglass color="blue" />;
    if (st === "in transit") return <FaTruck color="black" />;
    if (st === "fulfilled") return <FaCheckCircle color="green" />;
    return null;
  };

  // Utility: normalize items (support server's orderitem / orderItems)
  const getOrderItems = (order) => {
    if (!order) return [];
    return order.orderitem || order.orderItems || order.order_item || [];
  };

  // If order has a numeric total use that; otherwise compute from items
  const computeOrderTotal = (order) => {
    if (!order) return 0;
    if (typeof order.total === "number") return order.total;
    const items = getOrderItems(order);
    const total = items.reduce((acc, it) => {
      const unit =
        (it.product && (it.product.price ?? it.product.unitPrice)) ||
        // fallback to product lookup in redux
        (products.find((p) => p.id === it.productId)?.price ?? it.price) ||
        0;
      const qty = Number(it.quantity || 0);
      return acc + Number(unit) * qty;
    }, 0);
    return total;
  };

  const lookupProductFromRedux = (productId) => {
    if (!productId) return null;
    return products.find((p) => p.id === productId || p.productId === productId);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Nav />
      <Container className="py-5 flex-grow-1">
        <Card
          style={{
            maxWidth: 800,
            margin: "0 auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: 8,
          }}
        >
          <Card.Body style={{ padding: "2rem" }}>
            <h4 className="text-center mb-4">Personal Details</h4>

            {isAuthenticated ? (
              <>
                {["firstName", "lastName", "email", "passwordHash"].map((field) => (
                  <Row key={field} className="mb-3 align-items-center">
                    <Col xs={5}>
                      <strong>
                        {field === "passwordHash" ? "Password" : field.charAt(0).toUpperCase() + field.slice(1)}:
                      </strong>
                    </Col>
                    <Col xs={5}>{field === "passwordHash" ? "••••••••••" : user[field] || "N/A"}</Col>
                    <Col xs={2} className="text-end" style={{ cursor: "pointer" }}>
                      <FaPencilAlt onClick={() => handleEditClick(field, user[field])} />
                    </Col>
                  </Row>
                ))}

                <Row className="mb-3">
                  <Col xs={5}>
                    <strong>Phone:</strong>
                  </Col>
                  <Col xs={7}>{user.phone || "N/A"}</Col>
                </Row>

                {/* === LOGOUT BUTTON === */}
                <Row className="mb-4">
                  <Col className="text-center">
                    <Button variant="outline-danger" onClick={handleLogout}>
                      Logout
                    </Button>
                  </Col>
                </Row>
              </>
            ) : (
              <p className="text-center">Please log in.</p>
            )}

            {error && <p className="text-danger text-center">{error}</p>}

            <h5 className="text-center mt-5 mb-4">Order History</h5>

            {isApiLoading ? (
              <div className="text-center my-3">
                <Spinner animation="border" />
              </div>
            ) : orders.length === 0 ? (
              <p className="text-center">No orders found.</p>
            ) : (
              orders.map((o) => (
                <Row
                  key={o.orderid}
                  className="mb-3 border-bottom pb-3 align-items-center"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedOrder(o)}
                >
                  <Col xs={3}>
                    <strong>ORDER {String(o.orderid).toUpperCase()}</strong>
                    <div style={{ textTransform: "capitalize" }}>{o.status || "—"}</div>
                  </Col>
                  <Col xs={6} className="d-flex justify-content-center">
                    <Button variant="link" className="text-primary" onClick={() => setSelectedOrder(o)}>
                      View Details
                    </Button>
                  </Col>
                  <Col xs={3} className="text-end">
                    {renderIcon(o.status)}
                  </Col>
                </Row>
              ))
            )}

            {/* Admin Panel */}
            {user?.role !== "Customer" && (
              <div className="text-center mt-4">
                <Button onClick={() => navigate("/control")} variant="primary">
                  Admin Panel
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Footer */}
      <footer
        style={{
          background: "#f8f9fa",
          padding: "1rem 0",
          marginTop: "auto",
        }}
      >
        <Container className="text-center">
          <div>Contact: 0704288802</div>
          <div>
            <Link to="/terms-and-conditions" className="mx-2">
              Terms & Conditions
            </Link>
            |
            <Link to="/privacy-policy" className="mx-2">
              Privacy Policy
            </Link>
          </div>
          <div className="mt-2">© {new Date().getFullYear()} All rights reserved.</div>
        </Container>
      </footer>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editing {editingField}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="newValue">
            <Form.Label>
              New {editingField === "passwordHash" ? "Password" : editingField.charAt(0).toUpperCase() + editingField.slice(1)}
            </Form.Label>
            <Form.Control type={editingField === "passwordHash" ? "password" : "text"} value={newValue} onChange={(e) => setNewValue(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isApiLoading}>
            {isApiLoading ? <Spinner animation="border" size="sm" /> : "Submit"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Order Details Modal */}
      <Modal show={!!selectedOrder} onHide={() => setSelectedOrder(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Order Details – ORDER {String(selectedOrder?.orderid || "").toUpperCase()}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Items */}
          {getOrderItems(selectedOrder).length > 0 ? (
            <>
              {getOrderItems(selectedOrder).map((item, i) => {
                // prefer item.product (server-provided), else lookup in redux products
                const productFromOrder = item.product || null;
                const productFromRedux = lookupProductFromRedux(item.productId);
                const name = productFromOrder?.name || productFromRedux?.name || productFromOrder?.title || `Product ${item.productId || i + 1}`;
                const unitPrice =
                  Number(productFromOrder?.price ?? productFromOrder?.unitPrice ?? productFromRedux?.price ?? item.price ?? 0) || 0;
                const qty = Number(item.quantity || 0);
                const subtotal = unitPrice * qty;

                return (
                  <Row key={i} className="mb-3 align-items-center">
                    <Col xs={3}>
                      {productFromRedux?.productImage ? (
                        <img src={productFromRedux.productImage} alt={name} style={{ width: 80, height: 80, objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: 80, height: 80, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <small>No image</small>
                        </div>
                      )}
                    </Col>
                    <Col xs={6}>
                      <h6 style={{ marginBottom: 6 }}>{name}</h6>
                      <p style={{ marginBottom: 0 }}>Price: KSH {unitPrice.toFixed(2)}</p>
                      {/* show product id if helpful */}
                      {item.productId && <small className="text-muted">ID: {item.productId}</small>}
                    </Col>
                    <Col xs={3} className="text-end">
                      <p style={{ marginBottom: 6 }}>Qty: {qty}</p>
                      <p style={{ marginBottom: 0, fontWeight: "600" }}>Subtotal: KSH {subtotal.toFixed(2)}</p>
                    </Col>
                  </Row>
                );
              })}

              <hr />

              <Row className="mb-2">
                <Col xs={6}>
                  <strong>Order Total</strong>
                </Col>
                <Col xs={6} className="text-end">
                  <strong>KSH {computeOrderTotal(selectedOrder).toFixed(2)}</strong>
                </Col>
              </Row>

              {/* Optionally show order metadata */}
              <Row className="mb-1">
                <Col xs={6}>
                  <small className="text-muted">Status: {selectedOrder?.status || "—"}</small>
                </Col>
                <Col xs={6} className="text-end">
                  <small className="text-muted">Placed: {selectedOrder?.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : "—"}</small>
                </Col>
              </Row>
            </>
          ) : (
            <p className="text-center text-muted">No items.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Global Loader */}
      <Modal show={isApiLoading} centered backdrop="static" keyboard={false}>
        <Modal.Body className="text-center">
          <Spinner animation="border" role="status" />
          <p className="mt-3">Processing…</p>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Profile;
