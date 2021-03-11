// // import Telegraf from "telegraf"
// // import session from 'telegraf/session.js'
// // import mongoose from "mongoose"
// // import constants
// // import { DB_URL, BOT_URL } from "./src/const"
// // import keyboards
// require("./index")
// import { buttons } from "./src/keyboards"

// // const bot = new Telegraf(BOT_URL)
// // mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
// // bot.use(session())


// bot.hears('Отправить задание', async ctx => {
//   ctx.reply('Загрузите фото')
//   bot.on('photo', async ctx => {
//     await bot.telegram.sendPhoto(456418386, ctx.message.photo[0].file_id, 
//       { caption: `Задание на проверку от - ${ctx.chat.first_name} `, reply_markup: buttons }
//     )
//   })
// })