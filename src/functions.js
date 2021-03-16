import Telegraf from "telegraf"
const CronJob = require('cron').CronJob
const emoji = require('node-emoji')
import Task from "./models/task"
import User from "./models/user"
import Punishment from "./models/punishment"

import { getMenuWhenUserHavePunish } from "./keyboards"

import { DB_URL, BOT_URL } from "./const"
const bot = new Telegraf(BOT_URL)


export function addTask(id, text) {
    Task.create({ taskId: id, text: text })
}

export async function removeTask(id) {
    await Task.deleteOne({ taskId: { $gte: id }})
    .then(async function() {
        const tasks = await Task.find()
        for ( let i = 0; i < tasks.length; i++ ) {
            if ( tasks[i].taskId != i+1 ) {
                await Task.updateOne({ taskId: tasks[i].taskId }, { $set: { taskId: i + 1 } })
                .then(function() {
                    console.log("Data updated");
                }).catch(function(error) {
                    console.log(error);
                })
            }
        }
    }).catch(function(error) {
        console.log(error);
    })
}

export async function removeUser(id) {
    const user = await User.findOne({ userId: id })
    await User.updateOne({userId: user.userId}, { $set: { baned: true } })
}

export function addPunishment(id, text) {
    Punishment.create({ punishmentId: id, text: text })
}

export async function removePunishment(id) {
    await Punishment.deleteOne({ punishmentId: { $gte: id } })
    .then(async function() {
        const punishments = await Punishment.find()
        for ( let i = 0; i < punishments.length; i++ ) {
            if ( punishments[i].punishmentId != i+1 ) {
                await Punishment.updateOne({ punishmentId: punishments[i].punishmentId }, { $set: { punishmentId: i + 1 } })
                .then(function() {
                    console.log("Data updated");
                }).catch(function(error) {
                    console.log(error);
                })
            }
        }
        console.log("Data deleted");
    }).catch(function(error) {
        console.log(error);
    })
}

function getRandomInt(max){
    return Math.floor(Math.random() * Math.floor(max))
}

export function hasPunishmentStart() {
    console.log("Привет мир");

    var job = new CronJob('0 0 0 * * *', async function() {
        console.log("Punishment is wroked");

        var  users = await User.find((error, data) => {
            if (error) {
                console.log(error)
            } else {
                return data
            }
        })

        var punishments = await Punishment.find((error, data) => {
            if (error) {
                console.log(error)
            } else {
                return data
            }
        })
        for ( let i = 0; i < users.length; i++ ) {
            const randomIndex = getRandomInt(punishments.length)
            console.log("Random", randomIndex);
            if ( users[i].taskIsDone === false && users[i].baned === false ) {
                console.log("User task is not finish");
                await User.updateOne({ name: users[i].name }, { $set: { hasPunishment: true } })
                if(punishments[randomIndex].status === true && users[i].admin === false && users[i].baned === false) {
                    console.log("Punishment send message");
                    await bot.telegram.sendMessage(users[i].chatId, `Вы не успели во время сдать!\nВаше наказание - "${punishments[randomIndex].text}"`, getMenuWhenUserHavePunish())
                    await Punishment.updateOne({ _id: punishments[randomIndex]._id }, { $set: {status: false} })
                }
            }
        }
    }, null, true)
    job.start();
}

export function startSendTask() {
    console.log("StartSendTask");
  var job = new CronJob('0 32 14 * * *', async function() {
    console.log("Cron job worked");
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
      // const randomIndex = Math.round(0 - 0.5 + Math.random() * ((tasks.length - 1) - 0 + 1))
      console.log(getRandomInt(tasks.length - 1));
      const randomIndex = getRandomInt(tasks.length - 1)
      if(tasks[randomIndex].status === true && users[i].admin === false && users[i].baned === false) {
        await bot.telegram.sendMessage(users[i].chatId, `Задание на сегодня - "${tasks[randomIndex].text}"${emoji.get('smile')}`)
        await Task.updateOne({ _id: tasks[randomIndex]._id }, { $set: {status: false} })
        await User.updateOne({ name: users[i].name }, { $set: { taskIsDone: false } })
      }
    }
    
  }, null, true);
  
  job.start();
}