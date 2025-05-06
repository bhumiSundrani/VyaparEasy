import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);


export interface SmsPayload{
    phone: string;
    message: string
}

export async function sendSMS({phone, message} : SmsPayload){

    try {
        const response = client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
        })
        console.log("SMS sent successfully: ", response)
        return response
    } catch (error) {
        console.log("Error sending sms: ", error)
        throw new Error("SMS sending failed")
    }
}