const Markup = require('telegraf/markup')

function getMainAdminMenu() {
  return Markup.keyboard([
    ['Пользователи'],
    ['Наказания'],
    ['Задачи']
  ]).resize().extra()
}

function getUsersAdminMenu() {
  return Markup.keyboard([
    ['Список пользователей'],
    ['Заблокировать'],
    ['Назад']
  ]).resize().extra()
}

function getTasksAdminMenu() {
  return Markup.keyboard([
    ['Список задач'],
    ['Удалить задачу', 'Добавить задачу'],
    ['Назад']
  ]).resize().extra()
}

function getPunishmentAdminMenu() {
  return Markup.keyboard([
    ['Список наказаний'],
    ['Удалить наказание', 'Добавить наказание'],
    ['Назад']
  ]).resize().extra()
}

function getMenuWhenUserNotHavePunish() {
  return Markup.keyboard([
    ['Отправить задание'],
  ]).resize().extra()
}

function getMenuWhenUserHavePunish() {
  return Markup.keyboard([
    ['Отправить наказание']
  ]).resize().extra()
}

const yesNoBlockUserKeyboard = Markup.inlineKeyboard([
  Markup.callbackButton('Да', 'blockUser'),
  Markup.callbackButton('Нет', 'notBlockUser')
])

const yesNoAddTaskKeyboard = Markup.inlineKeyboard([
  Markup.callbackButton('Да', 'addTask'),
  Markup.callbackButton('Нет', 'notAddTask')
])

const yesNoRemoveTaskKeyboard = Markup.inlineKeyboard([
  Markup.callbackButton('Да', 'removeTask'),
  Markup.callbackButton('Нет', 'notRemoveTask')
])

const yesNoAddPunishmentKeyboard = Markup.inlineKeyboard([
  Markup.callbackButton('Да', 'addPunishment'),
  Markup.callbackButton('Нет', 'notAddPunishment')
])

const yesNoRemovePunishmentKeyboard = Markup.inlineKeyboard([
  Markup.callbackButton('Да', 'removePunishment'),
  Markup.callbackButton('Нет', 'notRemovePunishment')
])

const yesNoTaskAcceptButtons = Markup.inlineKeyboard([
  Markup.callbackButton('Принимаю', 'acceptTask'),
  Markup.callbackButton('Не принимаю', 'notAcceptTask')
])

const yesNoPunishmentAcceptButtons = Markup.inlineKeyboard([
  Markup.callbackButton('Принимаю', 'acceptPunishment'),
  Markup.callbackButton('Не принимаю', 'notAcceptPunishment')
])

module.exports = {
  getMainAdminMenu,
  getUsersAdminMenu,
  getTasksAdminMenu,
  getPunishmentAdminMenu,
  getMenuWhenUserNotHavePunish,
  getMenuWhenUserHavePunish,
  yesNoBlockUserKeyboard,
  yesNoAddTaskKeyboard,
  yesNoRemoveTaskKeyboard,
  yesNoAddPunishmentKeyboard,
  yesNoRemovePunishmentKeyboard,
  yesNoTaskAcceptButtons,
  yesNoPunishmentAcceptButtons
}