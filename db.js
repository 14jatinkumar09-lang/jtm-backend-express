const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
/// dependencies    
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();


async function connectDB() {
    try {
        console.log(process.env.uri)
    await mongoose.connect(process.env.uri);
    console.log("db connected")
} catch (error) {
    console.log("error, db not connected")
}
}
connectDB();

const User = mongoose.model("User", {
    userId: String,
    password: String,
    firstName: String,
    lastName: String
});



const Account = mongoose.model("Account", {
    userId: {
        type: String,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
});


module.exports = {
    User, Account
}
