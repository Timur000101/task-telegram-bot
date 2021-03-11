import mongoose from "mongoose"
const { Schema } = mongoose

const Punishment = Schema({
    punishmentId: { type: Number },
    status: { type: Boolean, default: true },
    text: { type: String }
})

export default mongoose.model('Punishment', Punishment)


// ctx.telegram.sendMessage(ctx.chat.id, `Вы действительно хотите добавить наказание`, {
    //   reply_markup: {
    //     inline_keyboard: [
    //       [{text: 'Да', callback_data: "yesAddPunishment"}, {text: "Нет", callback_data: "noAddPunishment"}]
    //     ]
    //   }
//     })