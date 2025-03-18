import axios from "axios";
const baseUrl = process.env.REACT_APP_BASE_API_URL;

export const editUserData = async ( phoneNumber , field, newValue) => {
    console.log(field,newValue)
  try {
    const response = await axios.put(`${baseUrl}/userdetails/${phoneNumber}`, { field, value: newValue });
    return response.data;  
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};
