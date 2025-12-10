const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const trainRoutes = require('./routes/trainRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// --- ENDPOINTS ---
app.use('/api', authRoutes);
app.use('/api', trainRoutes);

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});