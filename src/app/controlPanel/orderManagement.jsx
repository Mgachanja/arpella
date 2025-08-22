import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
  Modal,
  Box,
  Typography,
  CircularProgress,
  Paper,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { fetchStaffMembers } from '../../redux/slices/staffSlice'; // adjust path as needed
import { baseUrl } from '../../constants';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryGuy, setDeliveryGuy] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const dispatch = useDispatch();
  const staffList = useSelector((state) => state.staff.staffList || []);
  const deliveryGuys = staffList.filter(
    (staff) => (staff.role || '').toLowerCase() === 'delivery guy'
  );

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const { data } = await axios.get(`${baseUrl}/orders`);
        // assume data is an array of orders
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const { data } = await axios.get(`${baseUrl}/users`);
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Load staff
  useEffect(() => {
    dispatch(fetchStaffMembers());
  }, [dispatch]);

  const loading = ordersLoading || usersLoading;

  const filteredOrders = orders.filter((o) =>
    filterStatus === 'All' ? true : (o.status || '').toLowerCase() === filterStatus.toLowerCase()
  );

  const getCustomerFirstName = (userIdentifier) => {
    if (!userIdentifier) return '';
    // Try id match first, then phoneNumber.
    const u = users.find((x) => x.id === userIdentifier || x.phoneNumber === userIdentifier || x._id === userIdentifier);
    return u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || (u.firstName || u.phoneNumber) : userIdentifier;
  };

  const getStaffFullName = (s) => (s ? `${s.firstName || ''} ${s.lastName || ''}`.trim() : '');

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setDeliveryGuy(order.assignedDelivery?.phoneNumber || '');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedOrder(null);
    setDeliveryGuy('');
  };

  const computeItems = (order) => {
    if (!order) return [];
    // support order.orderItems or order.orderitem
    return order.orderItems || order.orderitem || order.order_item || [];
  };

  const computeOrderTotal = (order) => {
    if (!order) return 0;
    if (typeof order.total === 'number') return order.total;
    const items = computeItems(order);
    const total = items.reduce((acc, it) => {
      const price = (it.product && (it.product.price ?? it.product?.unitPrice)) || it.price || 0;
      const qty = Number(it.quantity || 0);
      return acc + Number(price) * qty;
    }, 0);
    return total;
  };

  const handleAssignDelivery = async () => {
    if (!selectedOrder) return;
    const staff = deliveryGuys.find((d) => d.phoneNumber === deliveryGuy || d.id === deliveryGuy || d._id === deliveryGuy);
    const name = getStaffFullName(staff) || deliveryGuy;

    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) =>
        o.orderid === selectedOrder.orderid ? { ...o, assignedDelivery: staff || { phoneNumber: deliveryGuy } } : o
      )
    );

    setToast({
      open: true,
      message: `Order #${selectedOrder.orderid} assigned to ${name}`,
      severity: 'success',
    });

    // Close the modal after assignment (keeps assign UI intact for next)
    setOpenModal(false);

    // Attempt to persist to API (adjust endpoint/payload to your backend)
    try {
      // If your API supports patching the order to set delivery assignment:
      await axios.patch(`${baseUrl}/orders/${selectedOrder.orderid}`, {
        deliveryGuyPhone: deliveryGuy,
      });
      // If the API returns updated order, you could replace it in state here.
    } catch (err) {
      // Revert optimistic update on failure
      console.error('Failed to persist delivery assignment:', err);
      setOrders((prev) =>
        prev.map((o) => (o.orderid === selectedOrder.orderid ? { ...o, assignedDelivery: undefined } : o))
      );
      setToast({
        open: true,
        message: `Failed to assign delivery: ${err?.message || 'server error'}`,
        severity: 'error',
      });
    } finally {
      setSelectedOrder(null);
      setDeliveryGuy('');
    }
  };

  const handleCloseToast = (e, reason) => {
    if (reason === 'clickaway') return;
    setToast({ ...toast, open: false });
  };

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
        Order Management
      </Typography>

      {/* Filter */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="subtitle1">Filter by Status:</Typography>
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} size="small">
          {['All', 'Pending', 'Shipped', 'Delivered'].map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Orders Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 3, mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#1976d2' }}>
              {['Order ID', 'Customer', 'Total', 'Status', 'Actions'].map((h) => (
                <TableCell key={h} sx={{ color: 'white', fontWeight: 'bold' }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.orderid} hover>
                <TableCell>{order.orderid}</TableCell>
                <TableCell>{getCustomerFirstName(order.userId || order.user)}</TableCell>
                <TableCell>{computeOrderTotal(order)}</TableCell>
                <TableCell>{order.status || '—'}</TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => handleOpenModal(order)}>
                    View Items
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Details Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            p: 3,
            width: { xs: '95%', sm: 700 },
            maxHeight: '85vh',
            borderRadius: 2,
            boxShadow: 3,
            overflow: 'auto',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            Order #{selectedOrder?.orderid} — {getCustomerFirstName(selectedOrder?.userId || selectedOrder?.user)}
          </Typography>

          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Items Purchased:
          </Typography>

          <List dense>
            {computeItems(selectedOrder).length === 0 && (
              <ListItem>
                <ListItemText primary="No items found for this order." />
              </ListItem>
            )}
            {computeItems(selectedOrder).map((item, i) => {
              const name = (item.product && (item.product.name || item.product.title)) || item.name || `Product ${item.productId || i + 1}`;
              const unitPrice = Number((item.product && (item.product.price ?? item.product.unitPrice)) || item.price || 0);
              const qty = Number(item.quantity || 0);
              const subtotal = unitPrice * qty;
              return (
                <React.Fragment key={i}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={`${name}`}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            Unit: {unitPrice} — Qty: {qty} — Subtotal: {subtotal}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              );
            })}
          </List>

          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2">Order Total: {computeOrderTotal(selectedOrder)}</Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Assign to Delivery Guy:
          </Typography>

          <Select
            value={deliveryGuy}
            onChange={(e) => setDeliveryGuy(e.target.value)}
            fullWidth
            size="small"
            disabled={!deliveryGuys.length}
            sx={{ mb: 2 }}
          >
            {deliveryGuys.length === 0 ? (
              <MenuItem value="">No delivery guys available</MenuItem>
            ) : (
              deliveryGuys.map((g) => (
                <MenuItem key={g.phoneNumber || g.id || g._id} value={g.phoneNumber || g.id || g._id}>
                  {getStaffFullName(g)}
                </MenuItem>
              ))
            )}
          </Select>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={handleAssignDelivery} disabled={!deliveryGuy}>
              Assign Delivery
            </Button>
            <Button variant="text" onClick={handleCloseModal}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>

      {/* Loading */}
      <Modal open={loading}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </Modal>
    </div>
  );
};

export default OrderManagement;
