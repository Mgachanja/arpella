import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Select, MenuItem, Modal, Box, Typography } from '@mui/material';

// Dummy Data for Orders
const ordersData = [
  { orderId: 1, customer: 'John Doe', total: 120.50, deliveryStatus: 'Pending', items: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6', 'Item 7'] },
  { orderId: 2, customer: 'Jane Smith', total: 200.00, deliveryStatus: 'Shipped', items: ['Item 8', 'Item 9', 'Item 10', 'Item 11', 'Item 12', 'Item 13', 'Item 14'] },
  { orderId: 3, customer: 'Mark Johnson', total: 350.75, deliveryStatus: 'Delivered', items: ['Item 15', 'Item 16', 'Item 17', 'Item 18', 'Item 19', 'Item 20', 'Item 21'] },
  { orderId: 4, customer: 'Alice Brown', total: 75.00, deliveryStatus: 'Pending', items: ['Item 22', 'Item 23', 'Item 24', 'Item 25', 'Item 26', 'Item 27', 'Item 28'] },
  { orderId: 5, customer: 'Eve White', total: 145.30, deliveryStatus: 'Shipped', items: ['Item 29', 'Item 30', 'Item 31', 'Item 32', 'Item 33', 'Item 34', 'Item 35'] },
];

// Dummy Delivery Guys
const deliveryGuys = ['Sam', 'Alex', 'Chris'];

const OrderManagement = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryGuy, setDeliveryGuy] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedOrder(null);
  };

  const handleAssignDelivery = () => {
    console.log(`Assigned to: ${deliveryGuy}`);
    // Handle the delivery assignment logic here
    setDeliveryGuy('');
    setOpenModal(false);
  };

  return (
    <div>
      {/* Order Management Table */}
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
        Order Management
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Delivery Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ordersData.map((order) => (
              <TableRow key={order.orderId} hover onClick={() => handleOpenModal(order)}>
                <TableCell>{order.orderId}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.total}</TableCell>
                <TableCell>{order.deliveryStatus}</TableCell>
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

      {/* Modal for Order Details */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: 4,
            width: 600,
            height: 500,
            borderRadius: 2,
            boxShadow: 3,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Modal Title with Order ID */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
            Order #{selectedOrder?.orderId} - {selectedOrder?.customer}
          </Typography>

          {/* Items Purchased List */}
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Items Purchased:
          </Typography>
          <ul>
            {selectedOrder?.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          {/* Assign Delivery Guy */}
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            Assign to Delivery Guy:
          </Typography>
          <Select
            value={deliveryGuy}
            onChange={(e) => setDeliveryGuy(e.target.value)}
            fullWidth
            sx={{ marginBottom: 2 }}
          >
            {deliveryGuys.map((guy, index) => (
              <MenuItem key={index} value={guy}>
                {guy}
              </MenuItem>
            ))}
          </Select>

          {/* Assign Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleAssignDelivery}
            disabled={!deliveryGuy}
            sx={{ alignSelf: 'flex-start' }}
          >
            Assign Delivery
          </Button>

          {/* Close Button */}
          <Button
            variant="text"
            sx={{ position: 'absolute', top: 8, right: 8, color: '#000' }}
            onClick={handleCloseModal}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default OrderManagement;
