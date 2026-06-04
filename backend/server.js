require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const leadsRoute = require('./routes/leads');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI && MONGO_URI !== 'your_mongodb_connection_string') {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('MongoDB connected successfully'))
        .catch(err => console.error('MongoDB connection error:', err));
} else {
    console.warn('⚠️ MONGO_URI is not configured in .env file. Database will not be connected.');
}

// Routes
app.use('/api/leads', leadsRoute);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started successfully on port ${PORT}`);
});
