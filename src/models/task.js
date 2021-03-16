const mongoose = require("mongoose")
const { Schema } = mongoose

const Task = new Schema({
  taskId: { type: Number },
  status: { type: Boolean, default: true },
  text: { type: String }
})

module.exports = mongoose.model('Task', Task)