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
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { fetchStaffMembers } from '../../redux/slices/staffSlice';
import { baseUrl } from '../../constants';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryGuy, setDeliveryGuy] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const dispatch = useDispatch();
  const staffList = useSelector((state) => state.staff.staffList || []);
  const deliveryGuys = staffList.filter(
    (staff) => (staff.role || '').toLowerCase() === 'delivery guy'
  );

  const DELIVERY_TRACKING_BASE = `${baseUrl}/deliverytracking`;

  const computeFullOrderId = (order) => {
    if (!order) return '';
    return order._id || order.id || order.orderId || order.orderid || '';
  };

  useEffect(() => {
    let cancelled = false;

    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const url = `${baseUrl}/paged-orders?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        const res = await axios.get(url);
        const data = res.data;

        let items = [];
        if (!data) items = [];
        else if (Array.isArray(data)) items = data;
        else if (Array.isArray(data.items)) items = data.items;
        else if (Array.isArray(data.data)) items = data.data;
        else if (Array.isArray(data.orders)) items = data.orders;
        else if (Array.isArray(data.results)) items = data.results;
        else items = [];

        if (cancelled) return;

        if (items.length === 0 && pageNumber > 1) {
          setPageNumber((p) => Math.max(1, p - 1));
          return;
        }

        setOrders(items);
        setIsLastPage(items.length < pageSize);
      } catch (err) {
        console.error('Failed to fetch orders (paged):', err);
        setOrders([]);
        setIsLastPage(true);
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    };

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [pageNumber, pageSize]);

  useEffect(() => {
    let cancelled = false;
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const { data } = await axios.get(`${baseUrl}/users`);
        if (!cancelled) setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        if (!cancelled) setUsers([]);
      } finally {
        if (!cancelled) setUsersLoading(false);
      }
    };
    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    dispatch(fetchStaffMembers());
  }, [dispatch]);

  const loading = ordersLoading || usersLoading;

  const filteredOrders = orders.filter((o) =>
    filterStatus === 'All' ? true : (o.status || '').toLowerCase() === filterStatus.toLowerCase()
  );

  const getCustomerFirstName = (userIdentifier) => {
    if (!userIdentifier) return 'Walk-in Customer';
    const u =
      users.find(
        (x) =>
          x.id === userIdentifier ||
          x.phoneNumber === userIdentifier ||
          x._id === userIdentifier ||
          x.username === userIdentifier
      ) || null;
    
    if (!u) return 'Walk-in Customer';
    
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
    return fullName || u.firstName || u.phoneNumber || u.username || 'Walk-in Customer';
  };

  const getStaffFullName = (s) => (s ? `${s.firstName || ''} ${s.lastName || ''}`.trim() : '');

  const isDeliveryAssigned = (order) => {
    if (!order) return false;
    const status = (order.status || '').toLowerCase();
    return status !== 'pending' && status !== 'not assigned' && status !== '';
  };

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setDeliveryGuy(
      order.assignedDelivery?.username ||
        order.assignedDelivery?.phoneNumber ||
        order.assignedDelivery?.id ||
        order.assignedDelivery?._id ||
        ''
    );
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedOrder(null);
    setDeliveryGuy('');
  };

  const computeItems = (order) => {
    if (!order) return [];
    return order.orderItems || order.orderitem || order.order_item || order.items || [];
  };

  const computeOrderTotal = (order) => {
    if (!order) return 0;
    if (typeof order.total === 'number') return order.total;
    const items = computeItems(order);
    return items.reduce((acc, item) => {
      const price = (item.product && (item.product.price ?? item.product?.unitPrice)) || item.price || 0;
      const qty = Number(item.quantity || 0);
      return acc + Number(price) * qty;
    }, 0);
  };

  const handleAssignDelivery = async () => {
    if (!selectedOrder) return;

    const staff = deliveryGuys.find((d) =>
      [d.phoneNumber, d.id, d._id, d.username].includes(deliveryGuy)
    );

    const staffDisplayName = getStaffFullName(staff) || staff?.username || deliveryGuy;

    const userKey = selectedOrder.userId || selectedOrder.user || selectedOrder.customerId || selectedOrder.customer;
    const customer =
      users.find(
        (x) =>
          x.id === userKey ||
          x._id === userKey ||
          x.username === userKey ||
          x.phoneNumber === userKey
      ) || null;

    const customerPhone =
      customer?.phoneNumber ||
      selectedOrder.customerPhone ||
      selectedOrder.phoneNumber ||
      selectedOrder.userPhone ||
      selectedOrder.phone ||
      selectedOrder.username ||
      selectedOrder.user ||
      '';

    const fullOrderId = computeFullOrderId(selectedOrder);
    if (!fullOrderId) {
      setToast({ open: true, message: `Cannot determine full order id.`, severity: 'error' });
      return;
    }

    const payload = {
      orderId: fullOrderId,
      username: customerPhone,
      deliveryAgent: staff?.username || staff?.phoneNumber || staffDisplayName || deliveryGuy,
    };

    const prevOrders = orders;

    setOrders((prev) =>
      prev.map((o) =>
        computeFullOrderId(o) === fullOrderId
          ? {
              ...o,
              assignedDelivery: staff || { phoneNumber: deliveryGuy, username: payload.deliveryAgent },
            }
          : o
      )
    );

    setToast({ open: true, message: `Order ${fullOrderId} assigned to ${payload.deliveryAgent}`, severity: 'success' });

    setOpenModal(false);

    try {
      const trackingUrl = `${DELIVERY_TRACKING_BASE}/`;
      await axios.post(trackingUrl, payload);

      setOrders((prev) =>
        prev.map((o) =>
          computeFullOrderId(o) === fullOrderId ? { ...o, status: 'processing' } : o
        )
      );
    } catch (err) {
      console.error('Failed in assignment or status update:', err);

      setOrders(prevOrders);

      setToast({
        open: true,
        message: `Failed to assign/update status: ${err?.response?.data?.message || err?.message || 'server error'}`,
        severity: 'error',
      });
    } finally {
      setSelectedOrder(null);
      setDeliveryGuy('');
    }
  };

  const handleSearchOrder = async () => {
    if (!searchOrderId.trim()) {
      setToast({ open: true, message: 'Please enter an order ID', severity: 'warning' });
      return;
    }

    setSearchLoading(true);
    try {
      const url = `${baseUrl}/order/${searchOrderId.trim()}`;
      const { data } = await axios.get(url);
      
      if (data) {
        setSelectedOrder(data);
        setDeliveryGuy(
          data.assignedDelivery?.username ||
            data.assignedDelivery?.phoneNumber ||
            data.assignedDelivery?.id ||
            data.assignedDelivery?._id ||
            ''
        );
        setOpenModal(true);
        setSearchOrderId('');
      } else {
        setToast({ open: true, message: 'Order not found', severity: 'error' });
      }
    } catch (err) {
      console.error('Failed to fetch order:', err);
      setToast({
        open: true,
        message: `Order not found: ${err?.response?.data?.message || err?.message || 'server error'}`,
        severity: 'error',
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCloseToast = (e, reason) => {
    if (reason === 'clickaway') return;
    setToast({ ...toast, open: false });
  };

  const handlePrevPage = () => setPageNumber((p) => Math.max(1, p - 1));
  const handleNextPage = () => {
    if (!isLastPage) setPageNumber((p) => p + 1);
  };
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageNumber(1);
    setIsLastPage(false);
  };

  const getRowStyle = (status) => {
    const normalizedStatus = (status || '').toLowerCase();
    if (normalizedStatus === 'pending') {
      return {
        backgroundColor: '#fff3e0',
        borderLeft: '4px solid #f44336',
      };
    }
    return {};
  };

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
        Order Management
      </Typography>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          value={searchOrderId}
          onChange={(e) => setSearchOrderId(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearchOrder()}
          placeholder="Search by Order ID"
          size="small"
          sx={{ width: { xs: '100%', sm: 400 } }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearchOrder} disabled={searchLoading} edge="end">
                  {searchLoading ? <CircularProgress size={20} /> : <SearchIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Filter + Pagination Controls */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="subtitle1">Filter by Status:</Typography>
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} size="small">
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered'].map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </Select>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
          <Typography variant="body2">Page Size:</Typography>
          <Select value={pageSize} onChange={handlePageSizeChange} size="small">
            {[10, 20, 50, 100].map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>

          <Button size="small" variant="outlined" onClick={handlePrevPage} disabled={pageNumber <= 1 || loading}>
            Prev
          </Button>

          <Typography variant="body2" sx={{ px: 1 }}>
            Page {pageNumber} {isLastPage ? '(last)' : ''}
          </Typography>

          <Button size="small" variant="outlined" onClick={handleNextPage} disabled={isLastPage || loading}>
            Next
          </Button>
        </Box>
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
            {filteredOrders.map((order) => {
              const key = computeFullOrderId(order) || JSON.stringify(order).slice(0, 20);
              const rowStyle = getRowStyle(order.status);
              return (
                <TableRow key={key} hover sx={rowStyle}>
                  <TableCell>{computeFullOrderId(order) || '-'}</TableCell>
                  <TableCell>{getCustomerFirstName(order.userId || order.user)}</TableCell>
                  <TableCell>{computeOrderTotal(order)}</TableCell>
                  <TableCell>{order.status || '—'}</TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small" onClick={() => handleOpenModal(order)}>
                      View Items
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}

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
            Order #{computeFullOrderId(selectedOrder)} — {getCustomerFirstName(selectedOrder?.userId || selectedOrder?.user)}
          </Typography>

          <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
            Status: {selectedOrder?.status || '—'}
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
            disabled={!deliveryGuys.length || isDeliveryAssigned(selectedOrder)}
            sx={{ mb: 2 }}
          >
            {deliveryGuys.length === 0 ? (
              <MenuItem value="">No delivery guys available</MenuItem>
            ) : (
              deliveryGuys.map((g) => (
                <MenuItem key={g.username || g.phoneNumber || g.id || g._id} value={g.username || g.phoneNumber || g.id || g._id}>
                  {getStaffFullName(g) || g.username || g.phoneNumber}
                </MenuItem>
              ))
            )}
          </Select>

          {isDeliveryAssigned(selectedOrder) && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
              This order has already been assigned for delivery.
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              onClick={handleAssignDelivery} 
              disabled={!deliveryGuy || isDeliveryAssigned(selectedOrder)}
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