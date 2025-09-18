import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
    region: {
        type: String,
        required: true,
        unique: true
    },
    priceregion: {
        type: Number,
        required: true
    }
});

export default mongoose.model("Blue", userSchema);