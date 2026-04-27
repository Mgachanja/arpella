import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useGetStaffMembersQuery, useAddStaffMutation, useDeleteStaffMutation } from "../../redux/api/staffApi";
import { 
  TextField, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Typography, MenuItem, Select, 
  InputAdornment, IconButton, CircularProgress, Collapse, Backdrop 
} from "@mui/material";
import { Visibility, VisibilityOff, Delete } from "@mui/icons-material";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';


const Staff = () => {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  // Get state using RTK Query
  const { data: staffList = [], isLoading, error } = useGetStaffMembersQuery();
  const [addStaffMutation] = useAddStaffMutation();
  const [deleteStaffMutation] = useDeleteStaffMutation();

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await addStaffMutation(data).unwrap();
      toast.success("Staff added successfully!");
      reset();
      setShowForm(false);
    } catch (err) {
      toast.error(err?.message || "Failed to add staff");
    } finally {
      setSubmitting(false);
    }
  };

 const handleDelete = async (phoneNumber) => {
  const result = await Swal.fire({
    title: 'Delete Staff Member?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  });

  if (!result.isConfirmed) return;

  try {
    await deleteStaffMutation(phoneNumber).unwrap();
    toast.success('Staff deleted successfully!');
  } catch (err) {
    toast.error(err?.message || 'Failed to delete staff member');
  }
};


  return (
    <div>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
        Staff Members
      </Typography>

      <Button 
        variant="contained" 
        onClick={() => setShowForm(f => !f)} 
        sx={{ mb: 2 }}
      >
        {showForm ? "Cancel" : "Add New Staff"}
      </Button>

      <Collapse in={showForm}>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>New Staff Details</Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="First Name"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              {...register("FirstName", { required: "First name is required" })}
              error={!!errors.FirstName}
              helperText={errors.FirstName?.message}
            />
            <TextField
              label="Last Name"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              {...register("LastName", { required: "Last name is required" })}
              error={!!errors.LastName}
              helperText={errors.LastName?.message}
            />

            <Select
              fullWidth
              displayEmpty
              sx={{ mb: 2 }}
              {...register("role", { required: "Role is required" })}
              error={!!errors.role}
              defaultValue=""
            >
              <MenuItem value="" disabled>Select Role</MenuItem>
              <MenuItem value="Order Manager">Order Manager</MenuItem>
              <MenuItem value="Accountant">Accountant</MenuItem>
              <MenuItem value="Customer">Customer</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Delivery Guy">Delivery Guy</MenuItem>
            </Select>
            {errors.role && (
              <Typography color="error" variant="caption" sx={{ mb: 2 }}>
                {errors.role.message}
              </Typography>
            )}

            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              {...register("email", { 
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Invalid email format"
                }
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              label="Phone Number"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              {...register("phoneNumber", { required: "Phone Number is required" })}
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber?.message}
            />
            
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              {...register("password", { required: "Password is required" })}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(p => !p)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button 
              variant="contained" 
              color="primary" 
              type="submit" 
              disabled={submitting}
            >
              Save
            </Button>
          </form>
        </Paper>
      </Collapse>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staffList.map((staff) => (
                <TableRow key={staff.phoneNumber}>
                  <TableCell>{staff.firstName}</TableCell>
                  <TableCell>{staff.lastName}</TableCell>
                  <TableCell>{staff.role}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.phoneNumber}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(staff.phoneNumber)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Backdrop
        open={submitting}
        sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress />
      </Backdrop>
    </div>
  );
};

export default Staff;
