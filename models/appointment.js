const mongoose = require("mongoose");

const appointmentSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "User",
  },
  dateSelected: String,
  starttimeslot: String,
  endtimeslot: String,
  isTimeSlotAvailable:{
    type:Boolean,
    default:true
  },
  TestType:String,
  testResult:Boolean
});

const Appoinment = mongoose.model("Appoinment", appointmentSchema);
module.exports = Appoinment;
