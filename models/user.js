const mongoose = require("mongoose");

const loginDataSchema = mongoose.Schema({
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  userType: {
    type: Object,
    default: "Driver",
  },
  firstName: {
    type: String,
    default: "Test",
  },
  lastName: {
    type: String,
    default: "User",
  },
  age: {
    type: Number,
    default: 0,
  },
  licenseNumber: {
    type: String,
    default: "XYZ",
  },
  dob: {
    type: Date,
    default: new Date(),
  },
  car_details: {
    make: { type: String, default: "1990" },
    model: { type: String, default: "Ferrari" },
    year: { type: Number, default: "2022" },
    plateNumber: { type: String, default: "Tom77" },
  },
});

const User = mongoose.model("User", loginDataSchema);
module.exports = User;
