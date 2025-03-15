import axios from 'axios';
import { Buffer } from 'buffer';

/**
 *
 * @param {Object} params
 * @param {number} params.amount - The amount to charge.
 * @param {string} params.phoneNumber - Customer's phone number (in format 2547XXXXXXXX).
 * @param {string} params.accountReference - A reference for the transaction.
 * @param {string} params.transactionDesc - Description for the transaction.
 * @param {string} params.callbackURL - A public endpoint for receiving payment callbacks.
 *
 * @returns {Promise<Object>} The response data from Daraja.
 */
export async function processMpesaPayment({ amount, phoneNumber, accountReference, transactionDesc, callbackURL }) {
  // Ensure the amount is a whole number (Mpesa API expects an integer)
  const chargeAmount = Math.round(amount);
  
  // Set up your credentials and constants (replace these with your own or load from env)
  const consumerKey = process.env.REACT_APP_DARAJA_CONSUMER_KEY;
const consumerSecret = process.env.REACT_APP_DARAJA_CONSUMER_SECRET;
const businessShortCode = process.env.REACT_APP_DARAJA_BUSINESS_SHORTCODE;
const passkey = process.env.REACT_APP_DARAJA_PASSKEY;
const finalCallbackURL = callbackURL || process.env.REACT_APP_DARAJA_CALLBACK_URL;
  // Use a default callback URL if none is provided

  // Generate timestamp in the format YYYYMMDDHHMMSS
  const now = new Date();
  const pad = (num) => num.toString().padStart(2, '0');
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  // Construct the password (base64 encoded string of BusinessShortCode + Passkey + Timestamp)
  const password = Buffer.from(businessShortCode + passkey + timestamp).toString('base64');

  // Generate access token
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  let accessToken;
  try {
    const tokenResponse = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    accessToken = tokenResponse.data.access_token;
  } catch (err) {
    console.error('Error fetching access token:', err.response ? err.response.data : err.message);
    throw new Error('Failed to get access token');
  }

  // Prepare the payload for the STK Push request
  const payload = {
    BusinessShortCode: businessShortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: chargeAmount, // Rounded amount from cart final cost
    PartyA: phoneNumber,  // Customer's phone number (from Redux)
    PartyB: businessShortCode,
    PhoneNumber: phoneNumber,
    CallBackURL: finalCallbackURL,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc,
  };

  // Send the STK Push request to Daraja
  try {
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log('Daraja Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error processing MPESA payment:', error.response ? error.response.data : error.message);
    throw new Error('MPESA payment processing failed');
  }
}
