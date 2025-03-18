import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { fetchStaffMembers } from "../../redux/slices/staffSlice";
import { addStaff, deleteStaff } from "../../services/AddStaff.js";
import { 
  TextField, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Typography, MenuItem, Select, 
  InputAdornment, IconButton, CircularProgress 
} from "@mui/material";
import { Visibility, VisibilityOff, Delete } from "@mui/icons-material";
import { toast } from "react-toastify";

const Staff = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  // Get state from Redux
  const { staffList, isLoading, error } = useSelector((state) => state.staff);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Fetch staff on component mount
  useEffect(() => {
    dispatch(fetchStaffMembers());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      console.log("Submitted Data:", data);
      await addStaff(data);
      toast.success("Staff added successfully!");
      dispatch(fetchStaffMembers()); 
      reset();
    } catch (err) {
      toast.error(err || "Failed to add staff");
    }
  };

  // Delete staff member
  const handleDelete = async (phoneNumber) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      await deleteStaff(phoneNumber);
      toast.success("Staff deleted successfully!");
      dispatch(fetchStaffMembers()); // Refresh list after deletion
    } catch (err) {
      toast.error(err || "Failed to delete staff member");
    }
  };

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
        Add Staff Member
      </Typography>

      {/* Staff Form */}
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

        {/* Role Dropdown */}
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
        {errors.role && <Typography color="error" variant="caption">{errors.role.message}</Typography>}

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
        
        {/* Password Input with Show/Hide Toggle */}
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
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
          Save
        </Button>
      </form>

      {/* Staff Members Table */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: "bold" }}>
        Staff Members
      </Typography>

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
                <TableCell>Actions</TableCell> {/* New column for delete button */}
              </TableRow>
            </TableHead>
            <TableBody>
              {staffList.map((staff, index) => (
                <TableRow key={index}>
                  <TableCell>{staff.firstName}</TableCell>
                  <TableCell>{staff.lastName}</TableCell>
                  <TableCell>{staff.role}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.phoneNumber}</TableCell>
                  <TableCell>
                    <IconButton color="error" onClick={() => handleDelete(staff.phoneNumber)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default Staff;
