const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config({path: './config/config.env'});

const app = express();

//Coonect database
connectDB();

//Init Middleware
app.use(express.json());

//Define routes
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/:id', require('./routes/admin'));
app.use('/api/admin/create-user', require('./routes/admin'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth/updateaccount', require('./routes/auth'));
app.use('/api/post', require('./routes/post'));
app.use('/api/post/:id', require('./routes/post'));
app.use('/api/post/:userId', require('./routes/post'));


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));