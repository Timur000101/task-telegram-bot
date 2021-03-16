import Markup from 'telegraf/markup'

export function getMainAdminMenu() {
  return Markup.keyboard([
    ['Пользователи'],
    ['Наказания'],
    ['Задачи']
  ]).resize().extra()
}

export function getUsersAdminMenu() {
  return Markup.keyboard([
    ['Список пользователей'],
    ['Заблокировать'],
    ['Назад']
  ]).resize().extra()
}

export function getTasksAdminMenu() {
  return Markup.keyboard([
    ['Список задач'],
    ['Удалить задачу', 'Добавить задачу'],
    ['Назад']
  ]).resize().extra()
}

export function getPunishmentAdminMenu() {
  return Markup.keyboard([
    ['Список наказаний'],
    ['Удалить наказание', 'Добавить наказание'],
    ['Назад']
  ]).resize().extra()
}

export function getMenuWhenUserNotHavePunish() {
  return Markup.keyboard([
    ['Отправить задание'],
  ]).resize().extra()
}

export function getMenuWhenUserHavePunish() {
  return Markup.keyboard([
    ['Отправить наказание']
  ]).resize().extra()
}

export const yesNoBlockUserKeyboard = Markup.inlineKeyboard([
  Markup.callbackButton('Да', 'blockUser'),
  Markup.callbackButton('Нет', 'notBlockUser')
])

export const yesNoAddTaskKeyboard = Markup.inlineKeyboard([
  Markup.callbackButton('Да', 'addTask'),
  Markup.callbackButton('Нет', 'notAddTask')
])

export const yesNoRemoveTaskKeyboard = Markup.inlineKeyboard([
  Markup.callbackButton('Да', 'removeTask'),
  Markup.callbackButton('Нет', 'notRemoveTask')
])

export const yesNoAddPunishmentKeyboard = Markup.inlineKeyboard([
  Markup.callbackButton('Да', 'addPunishment'),
  Markup.callbackButton('Нет', 'notAddPunishment')
])

export const yesNoRemovePunishmentKeyboard = Markup.inlineKeyboard([
  Markup.callbackButton('Да', 'removePunishment'),
  Markup.callbackButton('Нет', 'notRemovePunishment')
])

export const yesNoTaskAcceptButtons = Markup.inlineKeyboard([
  Markup.callbackButton('Принимаю', 'acceptTask'),
  Markup.callbackButton('Не принимаю', 'notAcceptTask')
])

export const yesNoPunishmentAcceptButtons = Markup.inlineKeyboard([
  Markup.callbackButton('Принимаю', 'acceptPunishment'),
  Markup.callbackButton('Не принимаю', 'notAcceptPunishment')
])