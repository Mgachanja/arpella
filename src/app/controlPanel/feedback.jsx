import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Paper, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

// Dummy Data for Feedback
const feedbackData = [
  { sender: 'John Doe', message: 'Great service, I love the products!', time: '2025-02-05 10:30 AM' },
  { sender: 'Jane Smith', message: 'Can you update the stock for more items?', time: '2025-02-05 12:45 PM' },
  { sender: 'Mark Johnson', message: 'Would love to see a loyalty program!', time: '2025-02-04 08:20 PM' },
];

const CustomerFeedback = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [reply, setReply] = useState('');

  const handleOpenModal = (feedback) => {
    setSelectedFeedback(feedback);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedFeedback(null);
    setReply('');
  };

  const handleSendReply = () => {
    // Add functionality to send the reply, e.g., save to the database
    console.log('Reply Sent:', reply);
    setReply('');
  };

  return (
    <div>
      {/* Customer Feedback Section */}
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
        Customer Feedback
      </Typography>
      <div>
        {feedbackData.map((feedback, index) => (
          <Paper key={index} sx={{ padding: 2, marginBottom: 2, cursor: 'pointer' }} onClick={() => handleOpenModal(feedback)}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {feedback.sender}
            </Typography>
            <Typography variant="body1">{feedback.message}</Typography>
            <Typography variant="caption" sx={{ display: 'block', marginTop: 1, textAlign: 'right' }}>
              {feedback.time}
            </Typography>
          </Paper>
        ))}
      </div>

      {/* Modal for Chat Reply */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: 4,
            width: 600, // Increased width for a larger chat modal
            height: 500, // Increased height
            borderRadius: 2,
            boxShadow: 3,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Modal Title with Sender Name */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
            {selectedFeedback?.sender}
          </Typography>

          {/* Chat Screen (Messages) */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column-reverse', // So that new messages appear at the bottom
            }}
          >
            {/* User's Message Bubble */}
            <Box sx={{
              alignSelf: 'flex-start',
              backgroundColor: '#e4e6eb',
              borderRadius: '20px',
              padding: '10px 15px',
              maxWidth: '75%',
              marginBottom: '8px',
            }}>
              <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                {selectedFeedback?.message}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ alignSelf: 'flex-start' }}>
              {selectedFeedback?.time}
            </Typography>

            {/* Add more dummy chat messages for the modal */}
            <Box sx={{
              alignSelf: 'flex-end',
              backgroundColor: '#009688',
              color: 'white',
              borderRadius: '20px',
              padding: '10px 15px',
              maxWidth: '75%',
              marginBottom: '8px',
            }}>
              <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                Thank you for your feedback! We'll look into it.
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ alignSelf: 'flex-end' }}>
              2025-02-05 12:30 PM
            </Typography>
          </Box>

          {/* Chat Input Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 'auto' }}>
            <TextField
              label="Type your reply"
              variant="outlined"
              fullWidth
              multiline
              rows={2}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              sx={{
                marginRight: 1,
                borderRadius: '20px',
                '& .MuiInputBase-root': {
                  paddingRight: '10px', // Space for the icon inside the input
                },
              }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={handleSendReply}
                    sx={{ padding: 0, color: '#009688' }}
                    disabled={!reply.trim()}
                  >
                    <SendIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>

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

export default CustomerFeedback;
