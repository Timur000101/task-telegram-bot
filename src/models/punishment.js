const mongoose = require("mongoose")
const { Schema } = mongoose

const Punishment = Schema({
    punishmentId: { type: Number },
    status: { type: Boolean, default: true },
    text: { type: String }
})

module.exports = mongoose.model('Punishment', Punishment)
