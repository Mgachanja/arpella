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
  Table,
} from "react-bootstrap";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Divider,
  IconButton as MuiIconButton,
  Chip,
  Button as MuiButton
} from "@mui/material";
import {
  Edit as EditIcon,
  ShoppingBag as OrderIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  ChevronRight as ChevronRightIcon
} from "@mui/icons-material";
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
import { useEditUserMutation } from "../../redux/api/authApi";

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
  const [editUserApi] = useEditUserMutation();

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
      await editUserApi({ phoneNumber: user.phone, payload }).unwrap();
      await Swal.fire("Saved!", "", "success");
      // The store is updated thanks to RTK query matcher in authSlice, so no need for reload normally 
      // but if other components strictly rely on it:
      window.location.reload();
    } catch (e) {
      Swal.fire("Error", e?.data?.message || e?.error || "Failed", "error");
    } finally {
      setIsApiLoading(false);
      setShowEditModal(false);
    }
  };

  const renderStatusChip = (status) => {
    const st = (status || "").toLowerCase();
    let color = "default";
    let icon = null;

    if (st === "pending") {
      color = "info";
      icon = <FaHourglass size={12} />;
    } else if (st === "in transit") {
      color = "warning";
      icon = <FaTruck size={12} />;
    } else if (st === "fulfilled") {
      color = "success";
      icon = <FaCheckCircle size={12} />;
    }

    return (
      <Chip
        icon={icon}
        label={st.toUpperCase()}
        size="small"
        color={color}
        sx={{ fontWeight: 700, fontSize: '0.65rem' }}
      />
    );
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

  const getInitials = (firstName, lastName) => {
    return `${(firstName || "").charAt(0)}${(lastName || "").charAt(0)}`.toUpperCase();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f9fafb"
      }}
    >
      <Nav />
      <Container className="py-5 flex-grow-1">
        <Row className="g-4">
          {/* Left Column: Personal Info */}
          <Col lg={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: '24px',
                border: '1px solid #e5e7eb',
                textAlign: 'center',
                position: 'sticky',
                top: '100px'
              }}
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  margin: '0 auto 20px',
                  bgcolor: '#c85d00',
                  fontSize: '2rem',
                  fontWeight: 700,
                  boxShadow: '0 10px 15px -3px rgba(200, 93, 0, 0.3)'
                }}
              >
                {getInitials(user?.firstName, user?.lastName)}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
                {user?.phone || user?.phoneNumber}
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ textAlign: 'left', mb: 4 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Email</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{user?.email || "N/A"}</Typography>
                    <MuiIconButton size="small" onClick={() => handleEditClick("email", user?.email)} sx={{ color: '#c85d00' }}>
                      <EditIcon fontSize="small" />
                    </MuiIconButton>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Password</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>••••••••••</Typography>
                    <MuiIconButton size="small" onClick={() => handleEditClick("passwordHash", "")} sx={{ color: '#c85d00' }}>
                      <EditIcon fontSize="small" />
                    </MuiIconButton>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {(user?.roles?.[0] || user?.role) !== "Customer" && (
                  <MuiButton
                    fullWidth
                    variant="contained"
                    startIcon={<AdminIcon />}
                    onClick={() => navigate("/control")}
                    sx={{
                      bgcolor: '#1f2937',
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#111827' }
                    }}
                  >
                    Admin Panel
                  </MuiButton>
                )}
                <MuiButton
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderWidth: '1.5px',
                    '&:hover': { borderWidth: '1.5px' }
                  }}
                >
                  Logout
                </MuiButton>
              </Box>
            </Paper>
          </Col>

          {/* Right Column: Order History */}
          <Col lg={8}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: '24px',
                border: '1px solid #e5e7eb',
                minHeight: '600px'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Box sx={{ p: 1.5, bgcolor: 'rgba(200, 93, 0, 0.1)', borderRadius: '12px' }}>
                  <OrderIcon sx={{ color: '#c85d00' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Order History</Typography>
              </Box>

              {isApiLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                  <Spinner animation="border" variant="warning" />
                </Box>
              ) : orders.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                  <Typography variant="h6" sx={{ color: '#9ca3af', mb: 1 }}>No orders yet</Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>When you place orders, they will appear here.</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {orders.map((o) => (
                    <Paper
                      key={o.orderid}
                      elevation={0}
                      onClick={() => setSelectedOrder(o)}
                      sx={{
                        p: 3,
                        borderRadius: '16px',
                        border: '1px solid #f3f4f6',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: '#c85d00',
                          backgroundColor: '#fffcf9',
                          transform: 'translateX(4px)'
                        }
                      }}
                    >
                      <Row className="align-items-center">
                        <Col xs={12} sm={4} className="mb-2 mb-sm-0">
                          <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 700, display: 'block' }}>
                            ORDER #{String(o.orderid).toUpperCase()}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#6b7280' }}>
                            {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                          </Typography>
                        </Col>
                        <Col xs={6} sm={4}>
                          <Typography variant="body1" sx={{ fontWeight: 700 }}>
                            KSH {computeOrderTotal(o).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </Typography>
                        </Col>
                        <Col xs={6} sm={4} className="text-end d-flex align-items-center justify-content-end gap-2">
                          {renderStatusChip(o.status)}
                          <ChevronRightIcon sx={{ color: '#d1d5db' }} />
                        </Col>
                      </Row>
                    </Paper>
                  ))}
                </Box>
              )}
            </Paper>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: '#fff',
          py: 6,
          mt: 'auto',
          borderTop: '1px solid #e5e7eb'
        }}
      >
        <Container>
          <Row className="gy-4">
            <Col md={6} className="text-center text-md-start">
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#c85d00', mb: 1 }}>Arpella Stores</Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Your trusted wholesale and retail shop in Ngong Matasia.
              </Typography>
            </Col>
            <Col md={6} className="text-center text-md-end">
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Customer Support</Typography>
                <Typography variant="body1" sx={{ color: '#c85d00', fontWeight: 800 }}>0704288802</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, gap: 3 }}>
                <Link to="/terms-and-conditions" style={{ textDecoration: 'none', color: '#6b7280', fontSize: '0.875rem' }}>Terms</Link>
                <Link to="/privacy-policy" style={{ textDecoration: 'none', color: '#6b7280', fontSize: '0.875rem' }}>Privacy</Link>
              </Box>
            </Col>
          </Row>
          <Divider sx={{ my: 4 }} />
          <Typography variant="body2" sx={{ textAlign: 'center', color: '#9ca3af' }}>
            © {new Date().getFullYear()} Arpella Stores. All rights reserved.
          </Typography>
        </Container>
      </Box>

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
    </Box>
  );
}

export default Profile;
