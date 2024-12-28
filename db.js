const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');

// Initialize app
const app = express();
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
const DB_URL = 'mongodb://127.0.0.1:27017/loginSystem'; // Use 127.0.0.1 instead of localhost to avoid IPv6 issues
mongoose
    .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // Exit process on database connection error
    });

// Define User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: String,
    mobile: String,
   
});

// User Model
const User = mongoose.model('User', userSchema);

// API Routes

// Root Route
app.get('/', (req, res) => {
    res.send('Welcome to the Login System API!');
});

// Signup Route
app.post('/signup', async (req, res) => {
    try {
        const { username, password, address, mobile} = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ username, password: hashedPassword, address, mobile });
        await user.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error!', error });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials!' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: 'Invalid credentials!' });
        }

        res.json({ message: 'Login successful!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error!', error });
    }
});

// Reset Password Route
app.post('/reset-password', async (req, res) => {
    try {
        const { username, newPassword } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();
        res.json({ message: 'Password reset successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error!', error });
    }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
