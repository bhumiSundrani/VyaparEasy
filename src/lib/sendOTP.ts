import axios from 'axios';

export async function sendOTP({ phone, otp }: { phone: string; otp: string }) {
  try {
    const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: process.env.FAST2SMS_API_KEY!,
        route: 'otp',
        variables_values: otp,
        flash: 0,
        numbers: phone,
      },
    });

    console.log('✅ SMS sent successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error sending SMS:', error.response?.data || error.message);
    throw new Error('You tried too many times, try again later!');
  }
}
