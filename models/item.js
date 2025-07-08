const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  product: String,
  price: Number,
  quantity: Number,
  unit: String
});

module.exports = mongoose.model('Item', itemSchema);
