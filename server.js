const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config()

const app = express();


//Connect database
connectDB();

//Init Middleware
app.use(express.json());


app.use(cors())

//Define routes
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/:id', require('./routes/admin'));
app.use('/api/admin/create-user', require('./routes/admin'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth/update-account/:id', require('./routes/auth'));
app.use('/api/post', require('./routes/post'));
app.use('/api/post/user/:userId', require('./routes/post'));
app.use('/api/post/:id', require('./routes/post'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
