const {Telegraf} = require("telegraf")
const session = require('telegraf/session.js')
const mongoose = require("mongoose")
const emoji = require('node-emoji')
const moment = require("moment")
moment.locale('ru')
// const constants
const { DB_URL, BOT_URL } = require("./src/const")
// const models
const User = require("./src/models/user")
const Task = require("./src/models/task")
const Punishment = require("./src/models/punishment")
// const keyboard functions
const { 
  getMainAdminMenu, 
  getUsersAdminMenu, 
  getTasksAdminMenu,
  getPunishmentAdminMenu,
  yesNoTaskAcceptButtons,
  yesNoAddTaskKeyboard,
  yesNoAddPunishmentKeyboard,
  yesNoPunishmentAcceptButtons,
  yesNoRemoveTaskKeyboard,
  yesNoRemovePunishmentKeyboard,
  yesNoBlockUserKeyboard
} = require("./src/keyboards")

const { 
  addTask, 
  removeTask, 
  removeUser, 
  addPunishment, 
  removePunishment,
  hasPunishmentStart,
  startSendTask
} = require("./src/functions")

// Initialization Telegraf constructor
const bot = new Telegraf(BOT_URL)
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
bot.use(session())

// Send task every day, at 12:00
startSendTask()
// Send punishment at 00:00, if user not complited task
hasPunishmentStart()

// Start bot function 
bot.start(async ctx => {
  let userName = ctx.from.first_name
  const chatId = ctx.chat.id
  
  var users = await User.find((error, data) => {
    if(error) {
      console.log(error)
    } else {
      return data
    }
  })
  // Check user role
  const user = await User.findOne({ chatId: chatId })
  if(!user) {
    User.create({ chatId: chatId, name: userName, userId: users.length + 1 })
    ctx.replyWithHTML(`
    Привет ${userName}!\nЯ буду давать задания каждый день в 12.00${emoji.get('smile')}`)
  } else if (user.admin === true) {
    ctx.replyWithHTML(`
    Привет <b>Администратор!</b>\nВыбирите действие для выполнение${emoji.get('smile')}`, getMainAdminMenu())
  } else if (user.baned === true) {
    ctx.reply(`Извините Вы заблокированы!`)
  } else if (user.hasPunishment === false) {
    ctx.replyWithHTML(`
    Привет ${userName}!\nЯ буду давать задания каждый день в 12.00${emoji.get('smile')}`)
  }
})

// User actions
bot.hears('Пользователи', async ctx => {
  ctx.replyWithHTML('<b>Выберите действие!</b>', getUsersAdminMenu())
})
// List of user
bot.hears('Список пользователей', async ctx => {
  const users = await User.find((error, data) => {
    if(error) {
      console.log(error);
    } else {
      return data
    }
  })

  let result = ''
  for (let i = 0; i < users.length; i++) {
    if (users[i].baned === true) {
      result = result = result + `[${i+1}] ${users[i].name} - ${moment(users[i].date).format('MM/DD/YYYY')} - заблокирован(а)\n`
    } else {
      result = result + `[${i+1}] ${users[i].name} - ${moment(users[i].date).format('MM/DD/YYYY')}\n`
    }
  }
  ctx.replyWithHTML(
    '<b>Список пользователей:</b>\n\n'+
    `${result}`
  )
})
// Block user
bot.hears('Заблокировать', ctx => {
  ctx.session.actionText = ctx.message.text
  ctx.replyWithHTML('Введите порядковый номер пользователя, чтобы заблокировать пользователя,\n')
})

// List of tasks
bot.hears('Задачи', ctx => {
  ctx.replyWithHTML('<b>Выберите действие!</b>', getTasksAdminMenu())
})

bot.hears('Список задач', async ctx => {
  const tasks = await Task.find((error, data) => {
    if(error) {
      console.log(error);
    } else {
      return data
    }
  })

  ctx.session.taskLength = tasks.length + 1
  let result = ''
  for (let i = 0; i < tasks.length; i++) {
    result = result + `[${tasks[i].taskId}] ${tasks[i].text}\n`
  }
  ctx.replyWithHTML(
    '<b>Список ваших задач:</b>\n\n'+
    `${result}`
  )
})

// add task listener
bot.hears('Добавить задачу', ctx => {
  ctx.session.actionText = ctx.message.text
  ctx.reply('Напишите задачу')
})
// Delete task listener
bot.hears('Удалить задачу', ctx => {
  ctx.session.actionText = ctx.message.text
  ctx.replyWithHTML('Напишите порядковый номер задачи:')
})
// Punishments
bot.hears('Наказания', ctx => {
  ctx.replyWithHTML('<b>Выберите действие!</b>', getPunishmentAdminMenu())
})
// List of punishments
bot.hears('Список наказаний', async ctx => {
  const punishments = await Punishment.find((error, data) => {
    if(error) {
      console.log(error);
    } else {
      return data
    }
  })

  ctx.session.punishmentsLength = punishments.length + 1
  let result = ''
  for (let i = 0; i < punishments.length; i++) {
    result = result + `[${punishments[i].punishmentId}] ${punishments[i].text}\n`
  }
  ctx.replyWithHTML(
    '<b>Список ваших наказаний:</b>\n\n'+
    `${result}`
  )
})
// Add punishent listener
bot.hears('Добавить наказание', ctx => {
  ctx.session.actionText = ctx.message.text
  console.log(3, ctx.session.actionText)
  ctx.reply('Напишите наказание')
})
// Delete punishment listener
bot.hears('Удалить наказание', ctx => {
  ctx.session.actionText = ctx.message.text
  console.log(1, ctx.update.message.text);
  ctx.replyWithHTML('Напишите порядковый номер наказание:')
})
// User listeners
// Send task listener
bot.hears('Отправить задание', ctx => {
  ctx.reply('Загрузите фото заданий')
  bot.on('photo', async ctx => {
    await ctx.telegram.sendPhoto(456418386, ctx.message.photo[0].file_id, 
      { 
        caption: `Задание на проверку от - ${ctx.chat.first_name} `,
        reply_markup: yesNoTaskAcceptButtons
      }
    )
  })
})
// Send punishment listener
bot.hears('Отправить наказание', ctx => {
  ctx.reply('Загрузите фото наказаний')
  bot.on('photo', async ctx => {
    await ctx.telegram.sendPhoto(456418386, ctx.message.photo[0].file_id, 
      { 
        caption: `Наказание на проверку от - ${ctx.chat.first_name} `,
        reply_markup: yesNoPunishmentAcceptButtons
      }
    )
  })
})
// Back to main menu listener
bot.hears('Назад', ctx => {
  ctx.replyWithHTML(`Выбирите действие для выполнение${emoji.get('smile')}`, getMainAdminMenu())
})



bot.on('text', ctx => {
  ctx.session.sendText = ctx.message.text
  if(ctx.session.actionText === 'Добавить наказание') {
    console.log('Add',ctx.session.sendText);
    ctx.reply('Вы действительно хотите добавить наказание:\n\n'+`${ctx.session.sendText}`, 
      {
        reply_markup: yesNoAddPunishmentKeyboard
      }
    )
    ctx.session.actionText = ''
    console.log(ctx.session.actionText);
  } else if (ctx.session.actionText === 'Удалить наказание') {
    console.log('Remove', ctx.session.sendText);
    ctx.reply('Вы действительно хотите удалить наказание:\n\n'+`${ctx.session.sendText}`, 
      {
        reply_markup: yesNoRemovePunishmentKeyboard
      }
    )
    ctx.session.actionText = ''
    console.log(ctx.session.actionText);
  } else if (ctx.session.actionText === 'Добавить задачу') {
    console.log('Add', ctx.session.sendText);
    ctx.reply(
      `Вы действительно хотите добавить задачу:\n\n`+
      `${ctx.session.sendText}`,
      {
        reply_markup: yesNoAddTaskKeyboard
      }
    )
    ctx.session.actionText = ''
    console.log(ctx.session.actionText);
  } else if (ctx.session.actionText === 'Удалить задачу') {
    console.log('Remove', ctx.session.sendText);
    ctx.replyWithHTML(
      `Вы действительно хотите удалить задачу:\n\n`+
      `<i>${ctx.session.sendText}</i>`,
      {
        reply_markup: yesNoRemoveTaskKeyboard
      }
    )
    ctx.session.actionText = ''
    console.log(ctx.session.actionText);
  } else if (ctx.session.actionText === 'Заблокировать') {
    console.log('Block', ctx.session.sendText);
    ctx.replyWithHTML(
      `Вы действительно хотите заблокировать пользователя:\n\n`+
      `<i>${ctx.session.sendText}</i>`,
      {
        reply_markup: yesNoBlockUserKeyboard
      }
    )
    ctx.session.actionText = ''
    console.log(ctx.session.actionText);
  } else {
    ctx.reply("Извините, Вы не можете отпрвавить сообщение, только задание или наказание")
  }
})

// Admin actions
// Block user action
bot.action(['blockUser', 'notBlockUser'], ctx => {
  if(ctx.callbackQuery.data === 'blockUser') {
    removeUser(ctx.session.sendText)
    ctx.editMessageText('Пользователь успешно заблокирован')
  } else {
    ctx.deleteMessage()
    ctx.replyWithHTML(`Выбирите действие для выполнение${emoji.get('smile')}`, getMainAdminMenu())
  }
})
// Add punishment action
bot.action(['addPunishment', 'notaddPunishment'], async ctx => {
  const punishments = await Punishment.find()

  if(ctx.callbackQuery.data === 'addPunishment') {
    addPunishment(punishments.length, ctx.session.sendText)
    ctx.editMessageText('Ваша наказание успешно создано')
  } else {
    ctx.deleteMessage()
    ctx.replyWithHTML(`Выбирите действие для выполнение${emoji.get('smile')}`, getMainAdminMenu())
  }
})
// Delete punishment action
bot.action(['removePunishment', 'notRemovePunishment'], ctx => {
  if (ctx.callbackQuery.data === 'removePunishment') {
    removePunishment(ctx.session.sendText)
    ctx.editMessageText('Ваша наказание успешно удалено')
  } else {
    ctx.deleteMessage()
    ctx.replyWithHTML(`Выбирите действие для выполнение${emoji.get('smile')}`, getMainAdminMenu())
  }
})
// Add task action
bot.action(['addTask', 'notAddTask'], async ctx => {
  const tasks = await Task.find()

  if (ctx.callbackQuery.data === 'addTask') {
    addTask(tasks.length, ctx.session.sendText)
    ctx.editMessageText('Ваша задача успешно добавлена')
  } else {
    ctx.deleteMessage()
    ctx.replyWithHTML(`Выбирите действие для выполнение${emoji.get('smile')}`, getMainAdminMenu())
  }
})
// Delete task action
bot.action(['removeTask', 'notRemoveTask'], ctx => {
  if (ctx.callbackQuery.data === 'removeTask') {
    removeTask(ctx.session.sendText)
    ctx.editMessageText('Ваша задача успешно удалено')
  } else {
    ctx.deleteMessage()
    ctx.replyWithHTML(`Выбирите действие для выполнение${emoji.get('smile')}`, getMainAdminMenu())
  }
})

// Client action
// Accept task
bot.action(['acceptTask', 'notAcceptTask'], async ctx => {
  const result = ctx.update.callback_query.message.caption
  const userName = result.split(' ')
  const user = await User.findOne({ name: userName })

  if(ctx.callbackQuery.data === 'acceptTask') {
    bot.telegram.sendMessage(user.chatId, `Ваше задание принято, ждите следующее задание!)`, {reply_markup : { remove_keyboard: true }})
    await User.updateOne({ name: userName }, { $set: { taskIsDone: true } })
    ctx.replyWithHTML(`<b>Задание принято!</b>`),
    ctx.deleteMessage()

  } else {
    // await User.updateOne({ name: userName }, { $set: { hasPunishment: true } })
    bot.telegram.sendMessage(user.chatId, `Вашу задачу не приняли, повторите попытку! :(`), 
    ctx.replyWithHTML(`Выбирите действие для выполнение${emoji.get('smile')}`, getMainAdminMenu())
    ctx.deleteMessage()
  }
})

// Accept punishment
bot.action(['acceptPunishment', 'notAcceptPunishment'], async ctx => {
  const result = ctx.update.callback_query.message.caption
  const userName = result.split(' ')
  const user = await User.findOne({ name: userName })

  if(ctx.callbackQuery.data === 'acceptPunishment') {
    bot.telegram.sendMessage(user.chatId, `Ваше наказание принято, ждите задание!)`, {reply_markup : { remove_keyboard: true }} )
    await User.updateOne({ name: userName }, { $set: { taskIsDone: true } })
    await User.updateOne({ name: userName }, { $set: { hasPunishment: false } })
    ctx.replyWithHTML(`<b>Наказание принято!</b>`)
    ctx.deleteMessage()
    
  } else {
    bot.telegram.sendMessage(user.chatId, `Ваш задание не приняли, повторите попытку! :(`)
    await User.updateOne({ name: userName }, { $set: { hasPunishment: true } })
    ctx.replyWithHTML(`Выбирите действие для выполнение${emoji.get('smile')}`, getMainAdminMenu())
    ctx.deleteMessage()
  }
})

// !Dispay logs line, use this line of code when necessary
bot.use(Telegraf.log())

// Error display function
bot.catch((err, ctx) => {
  console.log(`Уппс, обнаружена ошибка для ${ctx.updateType}`, err);
})

// Help function
bot.help((ctx) => ctx.reply('Дождитесь 12.00 дня, чтобы получить задачу!'))

// Start bot function
bot.launch()
