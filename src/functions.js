import Telegraf from "telegraf"
const CronJob = require('cron').CronJob
import Task from "./models/task"
import User from "./models/user"
import Punishment from "./models/punishment"

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

export async function hasPunishmentStart() {
    console.log("Привет мир");
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

    var job = new CronJob('0 9 14 * * *', async function() {
        for ( let i = 0; i < users.length; i++ ) {
            const randomIndex = Math.round(0 - 0.5 + Math.random() * ((punishments.length - 1) - 0 + 1))
            if ( users[i].taskIsDone === false && users[i].baned === false ) {
                console.log("User task is not finish");
                await User.updateOne({ name: users[i].name }, { $set: { hasPunishment: true } })
                if(punishments[randomIndex].status === true && users[i].admin === false) {
                    console.log("Punishment send message");
                    await bot.telegram.sendMessage(users[i].chatId, `Вы не успели во время сдать!\nВаше наказание - "${punishments[randomIndex].text}"`)
                    await Punishment.updateOne({ _id: punishments[randomIndex]._id }, { $set: {status: false} })
                }
            }
        }
    }, null, true)
    job.start();
}