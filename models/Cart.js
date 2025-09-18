import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
    active: {
        type: Boolean,
        default: true
    },
    username: {
        type: String,
        required: true
    },
    sellsdate: {
        type: Date,
        required: true
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'ProductQuantity',
        required: true,
    }],
    total: {
        type: Number,
        required: true
    },
    waitingpayment: {
        type: Boolean,
        default: false
    },
    sold: {
        type: Boolean,
        default: false
    }
});

export default mongoose.model("Cart", userSchema);