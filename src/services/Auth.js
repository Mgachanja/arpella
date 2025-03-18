import { toast } from 'react-toastify';
import axios from 'axios';

const baseUrl = process.env.REACT_APP_BASE_API_URL;


export const loginUserApi = async (credentials) => {
  try {
    const response = await axios.post(
      `${baseUrl}/login`,
      {
        userName: credentials.username, 
        PasswordHash: credentials.password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200) {
      console.log('response', response.data);
      return response.data[0];
    }
    throw new Error('Unexpected server response');
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data || 'Login failed');
    }
    throw new Error(error.message || 'An unexpected error occurred.');
  }
};






export const registerUserApi = async (userData) => {
  console.log(userData)
  try {
    const response = await axios.post(`${baseUrl}/register`, userData);
    console.log(response)
    return response.data[0];

  } catch (error) {
    console.log(error)

    const errorMessage = Array.isArray(error.response?.data) 
    ? error.response.data[0]?.message 
    : error.response?.data?.message || error.response?.data || 'Something went wrong'; 

    toast.error(errorMessage);
  }
};
