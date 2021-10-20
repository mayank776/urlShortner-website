const mongoose = require("mongoose");

const { validator } = require("../utils");

const urlSchema = new mongoose.Schema({
  longUrl: {
    type: "String",
    required: true,
    trim: true,
    validate: {
      validator: validator.validateUrl,
      message: "Please enter a valid url",
      isAsync: false,
    },
  },
  shortUrl: {
    type: "String",
    reqiured: true,
    unique: true,
  },
  urlCode: {
    type: "String",
    required: "url code requierd",
    lowercase: true,
    
  },
});

module.exports = mongoose.model("Url", urlSchema);
