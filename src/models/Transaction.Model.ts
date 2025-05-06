import mongoose, {Schema, Document, Types} from 'mongoose'

export interface Transaction extends Document{
    userId: Types.ObjectId;
    type: "purchase" | "sale";
    paymentType: "cash" | "credit";
    customer?: {
        name?: string;
        phone?: string
    };
    supplier?: {
        name?: string;
        phone?: string
    };
    items: {
        productId: Types.ObjectId;
        quantity: number;
        pricePerUnit: number
    }[];
    totalAmount: number;
    otherExpenses?: {
        name: string;
        amount: number
    }[]
}

const TransactionSchema: Schema<Transaction> = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["purchase", "sale"],
        required: true
    },
    paymentType: {
        type: String,
        enum: ["cash", "credit"],
        required: true
    },
    customer: {
        name: {
            type: String
        },
        phone: {
            type: String,
            match: [/^\+91[6-9]\d{9}$/, "Phone must be in +91XXXXXXXXXX format"]
        }
    },
    supplier: {
        name: {
            type: String
        },
        phone: {
            type: String,
            match: [/^\+91[6-9]\d{9}$/, "Phone must be in +91XXXXXXXXXX format"]
        }
    },
    items: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        pricePerUnit: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    otherExpenses: [{
        name: {
            type: String
        },
        amount: {
            type: Number
        }
    }]
}, {
    timestamps: true
})

const TransactionModel = 
    (mongoose.models.Transaction as mongoose.Model<Transaction>) ||
    mongoose.model<Transaction>('Transaction', TransactionSchema)

export default TransactionModel