import axios from "axios";
import { baseUrl } from "../constants";
export const addStaff = async (staffData) => {
  const userData = {
    firstName: staffData.FirstName,
    lastName: staffData.LastName,
    PhoneNumber: staffData.phoneNumber,
    email: staffData.Email,
    passwordHash: staffData.password
  };
  const requestData = {
    user: userData,
    role: staffData.role
  };

  console.log("adding staff", requestData);
  try {
    const response = await axios.post(`${baseUrl}/control`, requestData);
    return response.data; 
  } catch (error) {
    console.log(error);
    throw error.response?.data || "Something went wrong";
  }
};

// Function to delete a staff member by phone number
export const deleteStaff = async (PhoneNumber) => {
  try {
    const response = await axios.delete(`${baseUrl}/user/${PhoneNumber}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error.response?.data || "Failed to delete staff member";
  }
};

export const getStaffCount = async () => {
  try {
    const response = await axios.get(`${baseUrl}/staffs`); // Adjust the endpoint if needed
    return response.data.length; 
  } catch (error) {
    console.log(error);
    throw error.response?.data || "Failed to fetch staff count";
  }
};