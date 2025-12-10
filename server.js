require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// --------------------- DB CONNECT --------------------
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ MongoDB Error:", err));

// --------------------- USER SCHEMA -------------------
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: String,
    password: String,
    otp: String,
    isVerified: { type: Boolean, default: false }
});

const User = mongoose.model("User", userSchema);

// --------------------- EMAIL -------------------------
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --------------------- OTP ---------------------------
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// =============== SIGNUP ===============================
app.post("/signup", async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        const hashed = await bcrypt.hash(password, 10);
        const otp = generateOTP();

        const user = new User({
            name,
            email,
            phone,
            password: hashed,
            otp,
            isVerified: false
        });

        await user.save();

        await transporter.sendMail({
            to: email,
            subject: "Verify Your Account",
            html: `<h2>Your OTP: ${otp}</h2>`
        });

        res.json({ message: "Signup successful! Verify OTP sent to email." });
    } catch (err) {
        res.status(400).json({ error: "User already exists or error occurred" });
    }
});

// =============== VERIFY SIGNUP OTP ==================
app.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp)
        return res.status(400).json({ error: "Invalid OTP" });

    user.isVerified = true;
    user.otp = null;
    await user.save();

    res.json({ message: "Account verified successfully!" });
});

// ================= LOGIN =============================
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user)
        return res.status(400).json({ error: "User not found" });

    if (!user.isVerified)
        return res.status(400).json({ error: "Verify email before login" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
        return res.status(400).json({ error: "Incorrect password" });

    res.json({ message: "Login successful!" });
});

// ============ FORGOT PASSWORD (SEND OTP) ============
app.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Email not registered" });

    const otp = generateOTP();
    user.otp = otp;
    await user.save();

    await transporter.sendMail({
        to: email,
        subject: "Reset Password OTP",
        html: `<h2>Your OTP: ${otp}</h2>`
    });

    res.json({ message: "OTP sent to email" });
});

// ============ VERIFY RESET OTP =====================
app.post("/verify-reset-otp", async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.otp !== otp)
        return res.status(400).json({ error: "Invalid OTP" });

    res.json({ message: "OTP verified" });
});

// ============== RESET PASSWORD ======================
app.post("/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: hashed, otp: null });

    res.json({ message: "Password changed successfully!" });
});

// --------------------- START ------------------------
app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on port ${process.env.PORT}`);
});
