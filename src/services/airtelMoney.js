import axios from 'axios';

/**
 * Process an Airtel Money payment via a sample Airtel Money API.
 *
 * @param {Object} params
 * @param {number} params.amount - Amount to charge.
 * @param {string} params.phoneNumber - Customer's phone number (in appropriate format).
 * @param {string} params.accountReference - A reference for the transaction.
 * @param {string} params.transactionDesc - A description for the transaction.
 * @param {string} params.callbackURL - A public callback URL to receive payment responses.
 *
 * @returns {Promise<Object>} The response data from the Airtel Money API.
 */
export async function processAirtelMoneyPayment({ amount, phoneNumber, accountReference, transactionDesc, callbackURL }) {
  // Set up your Airtel Money credentials (replace these with your actual credentials or load from environment variables)
  const consumerKey = process.env.AIRTEL_CONSUMER_KEY;
  const consumerSecret = process.env.AIRTEL_CONSUMER_SECRET;
  const businessCode = process.env.AIRTEL_BUSINESS_CODE; // analogous to MPESA's BusinessShortCode
  const passkey = process.env.AIRTEL_PASSKEY; // if your integration requires a passkey

  // Generate a timestamp in YYYYMMDDHHMMSS format
  const now = new Date();
  const pad = (num) => num.toString().padStart(2, '0');
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  // Construct the password (if required) as a base64 encoded string of businessCode + passkey + timestamp
  const password = Buffer.from(businessCode + passkey + timestamp).toString('base64');

  // Retrieve an access token (this step assumes Airtel Money uses OAuth 2.0 similar to MPESA)
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  let accessToken;
  try {
    const tokenResponse = await axios.get(
      'https://sandbox.airtelmoney.com/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );
    accessToken = tokenResponse.data.access_token;
  } catch (err) {
    console.error('Error fetching Airtel Money access token:', err.response ? err.response.data : err.message);
    throw new Error('Failed to get Airtel Money access token');
  }

  // Prepare the payload for the Airtel Money transaction request.
  // Note: Adjust the field names and endpoint URL as per Airtel Money's actual API.
  const payload = {
    BusinessCode: businessCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline', // Example transaction type – update if different.
    Amount: amount,
    PartyA: phoneNumber,       // Customer's phone number.
    PartyB: businessCode,      // Business code.
    PhoneNumber: phoneNumber,  // Customer's phone number again.
    CallBackURL: callbackURL,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc,
  };

  try {
    // Send the transaction request to Airtel Money's API endpoint.
    // Replace the URL below with the actual Airtel Money endpoint.
    const response = await axios.post(
      'https://sandbox.airtelmoney.com/api/v1/transaction', 
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    console.log('Airtel Money Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error processing Airtel Money payment:', error.response ? error.response.data : error.message);
    throw new Error('Airtel Money payment processing failed');
  }
}
