import mongoose, { Schema } from "mongoose";
import { ObjectId } from "mongodb";

const userInfoSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    birthdate:{
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    comune: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    mail: {
        type: String,
        required: true
    },

});

export default mongoose.model("UserInfo", userInfoSchema);