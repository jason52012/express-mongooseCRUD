const mongoose = require("mongoose");

let studentSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
    max: [80, "you are too old for school"],
  },
  scholarShip: {
    merit: {
      type: Number,
      required: true,
      min: 0,
      max: [5000, "merit can not over 5000."],
    },
    other: {
      type: Number,
      required: true,
      default: 0,
    },
  },
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
