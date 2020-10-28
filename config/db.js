const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose
            .connect(process.env.MONGODB_URI || 'mongodb://localhost/admin-api', {
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true,
                useFindAndModify: false
            });
            console.log('MongoDB connected....');
    } catch(err) {
        console.error(err.message);
        process.exit(1);
    }
}

module.exports = connectDB