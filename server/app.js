const express = require('express');
const dbconfig = require('./app/config/dataBase');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const corsConfig = require('./app/config/corsConfig');
const morgan = require("morgan");
const path = require('path');
const passport = require('passport');
require('./app/config/passport');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
dbconfig();

app.use(morgan("dev"));
require('./app/middleware/cron');

app.use(corsConfig());
app.use(session({
    cookie: { maxAge: 60 * 60 * 1000 }, 
    secret: process.env.SESSION_SECRET || 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routers
const authRouter = require('./app/router/authRoute');
const profileRouter = require('./app/router/profileRouter');
const adminRouter = require('./app/router/adminRouter');
const gameRouter = require('./app/router/gameRoute');
const cartRouter = require('./app/router/cartRoute');
const purchaseRouter = require('./app/router/purchaseRoute');
const refundRouter = require('./app/router/refundRouter');
const homeRouter = require('./app/router/homeRouter');
const genreRouter = require('./app/router/genre&tagRoute');
const achievementRouter = require('./app/router/achievementRoute');
const friendRouter = require('./app/router/friendRoute');
const activityRouter = require('./app/router/activityRouter');
const forumRouter = require('./app/router/forumRoute');
const reviewRouter = require('./app/router/reviewRoute');
const notificationRouter = require('./app/router/notificationRouter');
const saleRouter = require('./app/router/saleRouter');
const analyticsRoute = require('./app/router/analyticsRoute');

app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/admin', adminRouter);
app.use('/api/game', gameRouter);
app.use('/api/cart', cartRouter);
app.use('/api/purchase', purchaseRouter);
app.use('/api/refund', refundRouter);
app.use('/api', genreRouter);
app.use('/api', homeRouter);
app.use('/api', achievementRouter);
app.use('/api/friend', friendRouter);
app.use('/api/activity', activityRouter);
app.use('/api/forum', forumRouter);
app.use('/api/review', reviewRouter);
app.use('/api/notification', notificationRouter);
app.use('/api/sales', saleRouter);
app.use('/api/analytics', analyticsRoute);

// HTTP server & Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // adjust for production
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    }
});

// --- Track online users securely with JWT ---
const onlineUsers = new Map(); // userId => socket.id

io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error"));

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
    } catch (err) {
        next(new Error("Authentication error"));
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id, 'UserID:', socket.userId);
    onlineUsers.set(socket.userId, socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
            console.log(`User ${socket.userId} removed from onlineUsers`);
        }
    });
});

// --- Export io and onlineUsers for controllers ---
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// --- Global Error Handling ---
app.use((req, res) => {
    res.status(404).json({ status: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error('Global Error:', err.message);
    res.status(500).json({ status: false, message: 'Internal server error' });
});

const port = process.env.PORT || 7000;
server.listen(port, () => {
    console.log('Server started on port', port);
});
