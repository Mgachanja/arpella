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
  const products = useSelector((s) => s.products.products);

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
        setOrders(data.filter((o) => o.userId === user.phone));
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
      email:
        editingField === "email" ? newValue : user.email,
      passwordHash:
        editingField === "passwordHash"
          ? newValue
          : user.passwordHash || "",
      phoneNumber: user.phone,
      firstName:
        editingField === "firstName"
          ? newValue
          : user.firstName,
      lastName:
        editingField === "lastName"
          ? newValue
          : user.lastName,
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
      await axios.put(
        `${baseUrl}/user-details/${user.phone}`,
        payload
      );
      await Swal.fire("Saved!", "", "success");
      window.location.reload();
    } catch (e) {
      Swal.fire(
        "Error",
        e?.response?.data?.message || "Failed",
        "error"
      );
    } finally {
      setIsApiLoading(false);
      setShowEditModal(false);
    }
  };

  const renderIcon = (status) => {
    const st = (status || "").toLowerCase();
    if (st === "pending") return <FaHourglass color="blue" />;
    if (st === "in transit")
      return <FaTruck color="black" />;
    if (st === "fulfilled")
      return <FaCheckCircle color="green" />;
    return null;
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
            <h4 className="text-center mb-4">
              Personal Details
            </h4>

            {isAuthenticated ? (
              <>
                {[
                  "firstName",
                  "lastName",
                  "email",
                  "passwordHash",
                ].map((field) => (
                  <Row
                    key={field}
                    className="mb-3 align-items-center"
                  >
                    <Col xs={5}>
                      <strong>
                        {field === "passwordHash"
                          ? "Password"
                          : field.charAt(0).toUpperCase() +
                            field.slice(1)}
                        :
                      </strong>
                    </Col>
                    <Col xs={5}>
                      {field === "passwordHash"
                        ? "••••••••••"
                        : user[field] || "N/A"}
                    </Col>
                    <Col
                      xs={2}
                      className="text-end"
                      style={{ cursor: "pointer" }}
                    >
                      <FaPencilAlt
                        onClick={() =>
                          handleEditClick(
                            field,
                            user[field]
                          )
                        }
                      />
                    </Col>
                  </Row>
                ))}

                <Row className="mb-3">
                  <Col xs={5}>
                    <strong>Phone:</strong>
                  </Col>
                  <Col xs={7}>
                    {user.phone || "N/A"}
                  </Col>
                </Row>

                {/* === LOGOUT BUTTON === */}
                <Row className="mb-4">
                  <Col className="text-center">
                    <Button
                      variant="outline-danger"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </Col>
                </Row>
              </>
            ) : (
              <p className="text-center">Please log in.</p>
            )}

            {error && (
              <p className="text-danger text-center">
                {error}
              </p>
            )}

            <h5 className="text-center mt-5 mb-4">
              Order History
            </h5>
            {orders.length === 0 ? (
              <p className="text-center">
                No orders found.
              </p>
            ) : (
              orders.map((o) => (
                <Row
                  key={o.orderid}
                  className="mb-3 border-bottom pb-3 align-items-center"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedOrder(o)}
                >
                  <Col xs={3}>
                    <strong>
                      ORDER {o.orderid.toUpperCase()}
                    </strong>
                    <div>{o.status}</div>
                  </Col>
                  <Col
                    xs={6}
                    className="d-flex justify-content-center"
                  >
                    <Button
                      variant="link"
                      className="text-primary"
                    >
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
                <Button
                  onClick={() => navigate("/control")}
                  variant="primary"
                >
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
          <div>Contact: 0704288802</div>
          <div>
            <Link
              to="/terms-and-conditions"
              className="mx-2"
            >
              Terms & Conditions
            </Link>
            |
            <Link
              to="/privacy-policy"
              className="mx-2"
            >
              Privacy Policy
            </Link>
          </div>
          <div className="mt-2">
            © {new Date().getFullYear()} All rights reserved.
          </div>
        </Container>
      </footer>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Editing {editingField}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="newValue">
            <Form.Label>
              New{" "}
              {editingField === "passwordHash"
                ? "Password"
                : editingField.charAt(0).toUpperCase() +
                  editingField.slice(1)}
            </Form.Label>
            <Form.Control
              type={
                editingField === "passwordHash"
                  ? "password"
                  : "text"
              }
              value={newValue}
              onChange={(e) =>
                setNewValue(e.target.value)
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEditModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isApiLoading}
          >
            {isApiLoading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Submit"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Order Details Modal */}
      <Modal
        show={!!selectedOrder}
        onHide={() => setSelectedOrder(null)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Order Details – ORDER{" "}
            {selectedOrder?.orderid?.toUpperCase()}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder?.orderItems?.length > 0 ? (
            selectedOrder.orderItems.map((item, i) => {
              const p = products.find(
                (x) => x.id === item.productId
              );
              return (
                <Row
                  key={i}
                  className="mb-3 align-items-center"
                >
                  <Col xs={3}>
                    {p?.productImage ? (
                      <img
                        src={p.productImage}
                        alt={p.name}
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          background: "#ccc",
                        }}
                      />
                    )}
                  </Col>
                  <Col xs={6}>
                    <h6>{p?.name}</h6>
                    <p>
                      Price: KSH {p?.price?.toFixed(2)}
                    </p>
                  </Col>
                  <Col xs={3}>
                    <p>Qty: {item.quantity}</p>
                  </Col>
                </Row>
              );
            })
          ) : (
            <p className="text-center text-muted">
              No items.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setSelectedOrder(null)}
          >
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
