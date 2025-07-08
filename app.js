const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const itemRoutes = require('./routes/itemRoutes');
const path = require('path');


const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/crud_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));

// Style
app.use('/style', express.static(path.join(__dirname, 'style')));

// Routes
app.use('/', itemRoutes);

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

app.set('view engine', 'ejs');
