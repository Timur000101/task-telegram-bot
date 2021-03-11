import mongoose from "mongoose"
const { Schema } = mongoose

const User = new Schema({
  userId: { type: Number },
  chatId: { type: Number },
  baned: { type: Boolean, default: false },
  name:  { type: String },
  admin: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  taskIsDone: { type: Boolean, default: false },
  hasPunishment: { type: Boolean, default: false }
});

export default mongoose.model('User', User)