import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    productid: {
        type: String,
        required: true,
        unique: true
    },
    productname: {
        type: String,
        required: true,
        unique: true
    },
    productdescription: {
        type: String,
        required: true,
    },
    productimage: {
        type: String,
        required: true,
    },
    productprice: {
        type: Number,
        required: true,
    },
    productstock: {
        type: Number,
        required: true,
    } 
});

export default mongoose.model("Product", userSchema);