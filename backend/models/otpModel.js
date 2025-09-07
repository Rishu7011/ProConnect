import mongoose from "mongoose"

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 120 // OTP expires after 2 minutes
    }
});

const OTPModel = mongoose.models.otp || mongoose.model("otp", OTPSchema);
export default OTPModel;