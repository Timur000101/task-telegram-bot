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

export function getUserMenu() {
  return Markup.keyboard([
    ['Отправить задание'],
    ['Отправить наказание']
  ]).resize().extra()
}

export function yesNoAddTaskKeyboard() {
  return Markup.inlineKeyboard([
    Markup.callbackButton('Да', 'addTask'),
    Markup.callbackButton('Нет', 'notAddTask')
  ], { columns: 2 }).extra()
}

export function yesNoRemoveTaskKeyboard() {
  return Markup.inlineKeyboard([
    Markup.callbackButton('Да', 'removeTask'),
    Markup.callbackButton('Нет', 'notRemoveTask')
  ], { columns: 2 }).extra()
}

export function yesNoAddPunishmentKeyboard() {
  return Markup.inlineKeyboard([
    Markup.callbackButton('Да', 'addPunishment'),
    Markup.callbackButton('Нет', 'notAddPunishment')
  ], { columns: 2 }).extra()
}

export function yesNoRemovePunishmentKeyboard() {
  return Markup.inlineKeyboard([
    Markup.callbackButton('Да', 'removePunishment'),
    Markup.callbackButton('Нет', 'notRemovePunishment')
  ], { columns: 2 }).extra()
}

export const yesNoTaskAcceptButtons = Markup.inlineKeyboard([
  Markup.callbackButton('Принимаю', 'acceptTask'),
  Markup.callbackButton('Не принимаю', 'notAcceptTask')
])

export const yesNoPunishmentAcceptButtons = Markup.inlineKeyboard([
  Markup.callbackButton('Принимаю', 'acceptPunishment'),
  Markup.callbackButton('Не принимаю', 'notAcceptPunishment')
])