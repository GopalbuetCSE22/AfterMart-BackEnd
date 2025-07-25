
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// app.use((req, res, next) => {
//     console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
//     //console.log('Request headers:', req.headers);
//     next();
// });

// Routes
const userRoutes = require('./routes/userRoutes.js');
const deliveryRoutes = require('./routes/deliveryRoutes.js');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

const productRoutes = require('./routes/productRoute.js');
const purchaseroutes = require('./routes/purchaseRoute.js');
const shipmentRoutes = require('./routes/shipmentRoutes.js');
const imageUploadRoute = require('./routes/imageUploadRoute.js');
const statsRoutes = require('./routes/statisticsRoutes');
const messageRoutes = require('./routes/messageRoutes.js');

const deliverymanRoutes = require('./routes/deliverymanRoutes.js');
const notificationRoutes = require('./routes/notificationRoutes.js');
// connecting to routes
app.use('/api/users', userRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/purchase', purchaseroutes);
app.use("/api/shipment", shipmentRoutes);
app.use('/api/uploadImage', imageUploadRoute);
app.use('/api/stats', statsRoutes);

app.use('/api/deliveryman', deliverymanRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('AfterMart Backend API is running...');
});

// const PORT = process.env.PORT || 5000;
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
