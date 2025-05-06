import mongoose, {Schema, Document, Types} from 'mongoose'

export interface Party extends Document{
    name: string;
    transactionId: Types.ObjectId[];
    phone: string;
    type: "customer" | "vendor";
    amount: number;
    dueDate?: Date;
    paid: boolean;
    remindersSent: number;
    lastReminderDate?: Date | null
}

const PartySchema : Schema<Party> = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    transactionId: [{
        type: Schema.Types.ObjectId,
        ref: "Transaction",
        required: true
    }],
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        match: [/^\+91[6-9]\d{9}$/, "Phone must be in +91XXXXXXXXXX format"],
        trim: true
    },
    type: {
        type: String,
        enum: ["customer", "vendor"],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date
    },
    paid: {
        type: Boolean,
        default: false
    },
    remindersSent: {
        type: Number,
        default: 0
    },
    lastReminderDate: {
        type: Date,
        default: null
    }
}, {timestamps: true})


const PartyModel = 
    (mongoose.models.Party as mongoose.Model<Party>) ||
    mongoose.model<Party>('Party', PartySchema)

export default PartyModel