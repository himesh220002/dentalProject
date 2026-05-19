const maskMongoUri = (uri) => {
    if (!uri) return 'None';
    return uri.replace(
        /^(mongodb\+srv:\/\/|mongodb:\/\/)([^:]+):([^@]+)@/,
        (match, protocol, username, password) => {
            return `${protocol}${username}:********@`;
        }
    );
};

require('dotenv').config({ override: true });
console.log('Current directory:', process.cwd());
console.log('MONGO_URI from env:', maskMongoUri(process.env.MONGO_URI));

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const https = require('https');

const app = express();
const server = http.createServer(app);

// --- Keep-alive mechanism ---
const keepAlive = (url) => {
    const interval = setInterval(async () => {
        try {
            const Config = require('./models/Config');
            const activeRenderConfig = await Config.findOne({ key: 'active_render' });
            const isActive = activeRenderConfig ? activeRenderConfig.value === 'true' : (process.env.ACTIVE_RENDER === 'true');

            if (!isActive) {
                console.log('Keep-alive disabled, skipping ping...');
                return;
            }

            console.log(`Pinging server at ${url} to keep it alive...`);
            https.get(url, (res) => {
                console.log(`Ping response: ${res.statusCode}`);
            }).on('error', (err) => {
                console.error('Keep-alive ping error:', err.message);
            });
        } catch (error) {
            console.error('Keep-alive error in interval:', error.message);
        }
    }, 5 * 60 * 1000); // every 5 minutes

    return interval;
};

// --- Middleware ---
app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://dental-project-zeta.vercel.app",
        process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.options(/.*/, cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Socket.io Setup ---
const io = new Server(server, {
    cors: {
        origin: [
            process.env.FRONTEND_URL,
            "http://localhost:3000",
            "http://localhost:5173",
            "https://dental-project-zeta.vercel.app"
        ].filter(Boolean),
        methods: ["GET", "POST"]
    }
});
app.set('socketio', io);

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// --- Database Connection ---
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dental-clinic')
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.log('MongoDB connection error:', err));
}

// --- Routes ---
const treatmentRoutes = require('./routes/treatmentRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const treatmentRecordRoutes = require('./routes/treatmentRecordRoutes');
const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');
const configRoutes = require('./routes/configRoutes');
const handoverRoutes = require('./routes/handoverRoutes');
const blogRoutes = require('./routes/blogRoutes');
const { initSchedules } = require('./utils/scheduler');

app.use('/api/treatments', treatmentRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/treatment-records', treatmentRecordRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/handover', handoverRoutes);
app.use('/api/blogs', blogRoutes);

app.get('/', (req, res) => {
    console.log('📬 [Server Status Check] Keep-alive / health ping received!');
    res.send('Dr. Tooth Dental Server is Running [Build: 2026-02-28 18:15]');
});

const PORT = process.env.PORT || 5000;

// --- Server Startup ---
if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);

        // Start keep-alive if RENDER_EXTERNAL_URL is available and we are on production/global side
        const externalUrl = process.env.RENDER_EXTERNAL_URL;
        const isLocal = !process.env.RENDER && (!process.env.NODE_ENV || process.env.NODE_ENV === 'development' || (externalUrl && (externalUrl.includes('localhost') || externalUrl.includes('127.0.0.1'))));
        if (externalUrl && !isLocal) {
            keepAlive(externalUrl);
            console.log(`Keep-alive initialized for: ${externalUrl}`);
        } else {
            console.log('Keep-alive not started: local environment detected.');
        }

        // Initialize Daily Scheduler
        initSchedules();
    });
}

module.exports = { app, server };
