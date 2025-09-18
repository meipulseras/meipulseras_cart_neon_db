import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    productid: {
        type: String,
        required: true,
    },
    productname: {
        type: String,
        required: true,
    },
    productprice: {
        type: Number,
        required: true,
    },
    productquantity: {
        type: Number,
        required: true,
    },
    producttotalamount: {
        type: Number,
        required: true,
    }
});

export default mongoose.model("ProductQuantity", userSchema);