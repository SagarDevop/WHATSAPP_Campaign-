require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        // Delete old admin if exists to fix hashing issue
        await User.deleteOne({ email: 'admin@devphics.com' });
        console.log('Old admin removed');

        await User.create({
            name: 'DevPhics Admin',
            email: 'admin@devphics.com',
            password: 'admin123'
        });

        console.log('Admin user created successfully!');
        console.log('Email: admin@devphics.com');
        console.log('Password: admin123');
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
