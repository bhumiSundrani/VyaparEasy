import mongoose, {Schema, Document, Types} from 'mongoose'

export interface SMS extends Document{
    partyId?: Types.ObjectId;
    userId?: Types.ObjectId;
    message: string;
    type: "stock_alert" | "creditor_payment" | "otp" | "repayment_reminder";
    deliveryStatus: "pending" | "failed" | "sent";
    sentAt?: Date | null
}

const SMSSchema: Schema<SMS> = new Schema({
    partyId: {
        type: Schema.Types.ObjectId,
        ref: "Party"
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    message: {
        type: String,
        required: true
    },
    type:{
        type: String,
        enum: ["stock_alert", "creditor_payment", "otp", "repayment_reminder"],
        required: true
    },
    deliveryStatus: {
        type: String,
        enum: ["pending", "failed", "sent"],
        default: "pending"
    },
    sentAt: {
        type: Date,
        default: null
    }
}, {timestamps: true})

const SMSModel = 
    (mongoose.models.SMS as mongoose.Model<SMS>) ||
    mongoose.model<SMS>('SMS', SMSSchema)

export default SMSModel