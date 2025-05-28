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
  const staffList = useSelector((state) => state.staff.staffList);
  const deliveryGuys = staffList.filter(
    (staff) => staff.role.toLowerCase() === 'delivery guy'
  );

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const { data } = await axios.get(`${baseUrl}/orders`);
        setOrders(data);
      } catch (err) {
        console.error(err);
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
        setUsers(data);
      } catch (err) {
        console.error(err);
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
    filterStatus === 'All' ? true : o.status.toLowerCase() === filterStatus.toLowerCase()
  );

  const getCustomerFirstName = (phone) => {
    const u = users.find((x) => x.phoneNumber === phone);
    return u ? u.firstName : phone;
  };

  const getStaffFullName = (s) => (s ? `${s.firstName} ${s.lastName}` : '');

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedOrder(null);
    setDeliveryGuy('');
  };

  const handleAssignDelivery = () => {
    const staff = deliveryGuys.find((d) => d.phoneNumber === deliveryGuy);
    const name = getStaffFullName(staff);
    setToast({
      open: true,
      message: `Order #${selectedOrder.orderid} assigned to ${name}`,
      severity: 'success',
    });
    setOpenModal(false);
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
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ mr: 2 }}>
          Filter by Status:
        </Typography>
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          size="small"
        >
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
              <TableRow
                key={order.orderid}
                hover
                onClick={() => handleOpenModal(order)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{order.orderid}</TableCell>
                <TableCell>{getCustomerFirstName(order.userId)}</TableCell>
                <TableCell>{order.total}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>
                  <Button variant="outlined" size="small">
                    View Items
                  </Button>
                </TableCell>
              </TableRow>
            ))}
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
            p: 4,
            width: 600,
            height: 500,
            borderRadius: 2,
            boxShadow: 3,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Order #{selectedOrder?.orderid} – {getCustomerFirstName(selectedOrder?.userId)}
          </Typography>

          <Typography variant="h6" sx={{ mb: 1 }}>
            Items Purchased:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            {selectedOrder?.orderItems.map((item, i) => (
              <li key={i}>
                {item.product?.name || 'Unknown Product'} – Qty: {item.quantity}
              </li>
            ))}
          </Box>

          <Typography variant="h6" sx={{ mb: 1 }}>
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
                <MenuItem key={g.phoneNumber} value={g.phoneNumber}>
                  {getStaffFullName(g)}
                </MenuItem>
              ))
            )}
          </Select>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={handleAssignDelivery}
              disabled={!deliveryGuy}
            >
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
