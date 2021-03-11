import mongoose from "mongoose"
const { Schema } = mongoose

const Task = new Schema({
  taskId: { type: Number },
  status: { type: Boolean, default: true },
  text: { type: String }
})

export default mongoose.model('Task', Task)