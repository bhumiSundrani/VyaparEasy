import axios from 'axios';

export interface SmsPayload {
  phone: string;     // 10-digit Indian number
  message: string;
}

export async function sendSMS({ phone, message }: SmsPayload) {
    console.log("In send otp")
  try {
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        route: 'q',
        sender_id: 'FSTSMS',
        message,
        language: 'english',
        flash: 0,
        numbers: phone,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY, // Load from .env
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ SMS sent successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error sending SMS:', error.response?.data || error.message);
    throw new Error('SMS sending failed');
  }
}