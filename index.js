import Telegraf from "telegraf"
import session from 'telegraf/session.js'
import mongoose from "mongoose"
const emoji = require('node-emoji')
const CronJob = require('cron').CronJob
import moment from "moment"
moment.locale('ru')
// import constants
import { DB_URL, BOT_URL } from "./src/const"
// import models
import User from "./src/models/user"
import Task from "./src/models/task"
import Punishment from "./src/models/punishment"
// import keyboard functions
import { 
  getMainAdminMenu, 
  getUsersAdminMenu, 
  getTasksAdminMenu,
  getPunishmentAdminMenu,
  getUserMenu,
  yesNoTaskAcceptButtons,
  yesNoAddTaskKeyboard,
  yesNoAddPunishmentKeyboard,
  yesNoPunishmentAcceptButtons
} from "./src/keyboards"

import { 
  addTask, 
  removeTask, 
  removeUser, 
  addPunishment, 
  removePunishment,
  hasPunishmentStart
  // getUserChatId,
  // sendUserChatId
} from "./src/functions"

// Initialization Telegraf constructor
const bot = new Telegraf(BOT_URL)
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
bot.use(session())

hasPunishmentStart()


// Send task to users function
function startSendTask(ctx) {
  var job = new CronJob('* * * * * *', async function() {
    // get all Users
     var users = await User.find((error, data) => {
      if(error) {
        console.log(error)
      } else {
        return data
      }
    })

    // get all Tasks
    var tasks = await Task.find((error, data) => {
      if(error) {
        console.log(error);
      } else {
        return data
      }
    })

    for (let i = 0; i < users.length; i++) {
      const randomIndex = Math.round(0 - 0.5 + Math.random() * ((tasks.length - 1) - 0 + 1))
      if(tasks[randomIndex].status === true && users[i].admin === false) {
        await ctx.telegram.sendMessage(users[i].chatId, `Задание на сегодня - "${tasks[randomIndex].text}"${emoji.get('smile')}`)
        await Task.updateOne({ _id: tasks[randomIndex]._id }, { $set: {status: false} })
        await User.updateOne({ name: users[i].name }, { $set: { taskIsDone: false } })
      }
    }
    
  }, null, true);
  
  job.start();
}


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

  const user = await User.findOne({ chatId: chatId })
  if(!user) {
    User.create({ chatId: chatId, name: userName, userId: users.length + 1 })
    ctx.replyWithHTML(`
    Привет ${userName}!\nЯ буду давать задания каждый день в 12.00${emoji.get('smile')}`, getUserMenu())
    startSendTask(ctx)
  } else if (user.admin === true) {
    ctx.replyWithHTML(`
    Привет <b>Администратор!</b>\nВыбирите действие для выполнение${emoji.get('smile')}`, getMainAdminMenu())
  } else if (user.baned === true) {
    ctx.reply(`Извините Вы заблокированы!`)
  } else {
    ctx.replyWithHTML(`
    Привет ${userName}!\nЯ буду давать задания каждый день в 12.00${emoji.get('smile')}`, getUserMenu())
    startSendTask(ctx)
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
    result = result + `[${i+1}] ${users[i].name} - ${moment(users[i].date).format('MMMM Do YYYY, h:mm:ss a')}\n`
  }
  ctx.replyWithHTML(
    '<b>Список пользователей:</b>\n\n'+
    `${result}`
  )
})
// Block user
bot.hears('Заблокировать', ctx => {
  ctx.replyWithHTML(
    'Введите фразу <i>"заблокировать `порядковый номер пользователя`"</i>, чтобы заблокировать пользователя,\n'+
    'например, <b>"заблокировать 3"</b>:',
  )
})

bot.hears(/^заблокировать\s(\d+)$/, async ctx => {
  const id = Number(+/\d+/.exec(ctx.message.text))
  removeUser(id)
  ctx.reply('Пользователь успешно удален')
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
// Add new Task
bot.hears('Добавить задачу', ctx => {
  ctx.reply('Напишите задачу')
  bot.on('text', ctx => {
    ctx.session.taskText = ctx.message.text
    ctx.replyWithHTML(
      `Вы действительно хотите добавить задачу:\n\n`+
      `<i>${ctx.message.text}</i>`,
      yesNoAddTaskKeyboard()
    )
  })
})
// Add Task inlineKeyboard
bot.action(['addTask', 'notAddTask'], ctx => {
  if (ctx.callbackQuery.data === 'addTask') {
    addTask(ctx.session.taskLength, ctx.session.taskText)
    ctx.editMessageText('Ваша задача успешно добавлена')
  } else {
    ctx.deleteMessage()
    ctx.replyWithHTML(`Выбирите действие для выполнение${emoji.get('smile')}`, getMainAdminMenu())
  }
})
// Remove Task by Id
bot.hears('Удалить задачу', ctx => {
  ctx.replyWithHTML(
    'Введите фразу <i>"удалить задачу `порядковый номер задачи`"</i>, чтобы удалить задачу,\n'+
    'например, <b>"удалить задачу 3"</b>:'
  )
})

bot.hears(/^Удалить задачу\s(\d+)$/, ctx => {
  const id = Number(+/\d+/.exec(ctx.message.text)) - 1
  removeTask(id+1)
  ctx.reply('Ваша задача успешно удалена')
})


bot.hears('Наказания', ctx => {
  ctx.replyWithHTML('<b>Выберите действие!</b>', getPunishmentAdminMenu())
})

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
    '<b>Список ваших задач:</b>\n\n'+
    `${result}`
  )
})

bot.hears('Добавить наказание', ctx => {
  ctx.reply('Напишите наказание')
  bot.on('text', ctx => {
    ctx.session.punishmentText = ctx.message.text
    ctx.replyWithHTML(
      `Вы действительно хотите добавить наказание:\n\n`+
      `<i>${ctx.message.text}</i>`,
      yesNoAddPunishmentKeyboard()
    )
  })
  ctx.deleteMessage()
})


bot.action(['addPunishment', 'notaddPunishment'], ctx => {
  if(ctx.callbackQuery.data === 'addPunishment') {
    addPunishment(ctx.session.punishmentsLength, ctx.session.punishmentText)
    ctx.editMessageText('Ваша наказание успешно создано')
  } else {
    ctx.replyWithHTML(`Выбирите действие для выполнение${emoji.get('smile')}`, getMainAdminMenu())
    ctx.deleteMessage()
  }
})

bot.hears('Удалить наказание', ctx => {
  ctx.replyWithHTML(
    'Введите фразу <i>"удалить наказание `порядковый номер задачи`"</i>, чтобы удалить наказание,\n'+
    'например, <b>"удалить наказание 3"</b>:'
  )
  ctx.deleteMessage()
})

bot.hears(/^Удалить наказание\s(\d+)$/, ctx => {
  const id = Number(+/\d+/.exec(ctx.message.text))
  removePunishment(id)
  ctx.reply('Ваше наказание успешно удалено')
})

// Client action
// Send tasks

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

// Accept task
bot.action(['acceptTask', 'notAcceptTask'], async ctx => {
  const result = ctx.update.callback_query.message.caption
  const userName = result.split(' ')
  const user = await User.findOne({ name: userName })

  if(ctx.callbackQuery.data === 'acceptTask') {
    bot.telegram.sendMessage(user.chatId, `Ваше задание принято ждите слдщ задание!)`)
    await User.updateOne({ name: userName }, { $set: { taskIsDone: true } })
    ctx.replyWithHTML(`<b>Задание принято!</b>`)
  } else {
    bot.telegram.sendMessage(user.chatId, `Вашу задачу не принял, повторите попытку! :(`)
    await User.updateOne({ name: userName }, { $set: { hasPunishment: true } })
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
    bot.telegram.sendMessage(user.chatId, `Ваше наказание принято, ждите задание!)`)
    await User.updateOne({ name: userName }, { $set: { taskIsDone: true } })
    await User.updateOne({ name: userName }, { $set: { hasPunishment: false } })
    ctx.replyWithHTML(`<b>Наказание принято!</b>`)
  } else {
    bot.telegram.sendMessage(user.chatId, `Ваш задание не принял, повторите попытку! :(`)
    await User.updateOne({ name: userName }, { $set: { hasPunishment: true } })
    ctx.replyWithHTML(`Выбирите действие для выполнение${emoji.get('smile')}`, getMainAdminMenu())
    ctx.deleteMessage()
  }
})


// Back action
bot.hears('Назад', ctx => {
  ctx.replyWithHTML(`Выбирите действие для выполнение${emoji.get('smile')}`, getMainAdminMenu())
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
