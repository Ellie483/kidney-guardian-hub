const express = require('express');
const mongoose = require('mongoose');
const testRoutes = require('./routes/test.routes'); // import routes

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.use('/', testRoutes); // use routes

// DB connection
mongoose.connect('mongodb+srv://lynnkhant:dfXOCnB2dZZ9cGmX@cluster0.wqyif61.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error(err));
