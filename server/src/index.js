require('dotenv').config();
console.log('Current directory:', process.cwd());
console.log('MONGO_URI from env:', process.env.MONGO_URI);
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const https = require('https');

const app = express();
const server = http.createServer(app);

// Keep-alive mechanism to prevent Render from sleeping
const keepAlive = (url) => {
    setInterval(() => {
        try {
            console.log(`Pinging server at ${url} to keep it alive...`);
            https.get(url, (res) => {
                console.log(`Ping response: ${res.statusCode}`);
            }).on('error', (err) => {
                console.error('Keep-alive ping error:', err.message);
            });
        } catch (error) {
            console.error('Keep-alive error:', error.message);
        }
    }, 5 * 60 * 1000); // 5 minutes
};

// Middleware
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "https://dental-project-zeta.vercel.app", process.env.FRONTEND_URL].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.options('(.*)', cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: [process.env.FRONTEND_URL, "http://localhost:3000", "http://localhost:5173", "https://dental-project-zeta.vercel.app"].filter(Boolean), // Allow frontend connection
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dental-clinic')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Routes
const treatmentRoutes = require('./routes/treatmentRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const treatmentRecordRoutes = require('./routes/treatmentRecordRoutes');
const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');
const configRoutes = require('./routes/configRoutes');
const handoverRoutes = require('./routes/handoverRoutes');

app.use('/api/treatments', treatmentRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/treatment-records', treatmentRecordRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/handover', handoverRoutes);

app.get('/', (req, res) => {
    res.send('Dr. Tooth Dental Clinic Server is Running');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Start keep-alive if RENDER_EXTERNAL_URL is available
    const externalUrl = process.env.RENDER_EXTERNAL_URL;
    if (externalUrl) {
        keepAlive(externalUrl);
        console.log(`Keep-alive started for: ${externalUrl}`);
    } else {
        console.log('Keep-alive not started: RENDER_EXTERNAL_URL not found (likely local environment).');
    }
});
