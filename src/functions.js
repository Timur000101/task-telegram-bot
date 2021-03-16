const {Telegraf} = require("telegraf")
const CronJob = require('cron').CronJob
const emoji = require('node-emoji')
const Task = require("./models/task")
const User = require("./models/user")
const Punishment = require("./models/punishment")

const { getMenuWhenUserHavePunish, getMenuWhenUserNotHavePunish } = require("./keyboards")

const { DB_URL, BOT_URL } = require("./const")
const bot = new Telegraf(BOT_URL)


function addTask(id, text) {
    Task.create({ taskId: id, text: text })
}

async function removeTask(id) {
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

async function removeUser(id) {
    const user = await User.findOne({ userId: id })
    await User.updateOne({userId: user.userId}, { $set: { baned: true } })
}

function addPunishment(id, text) {
    Punishment.create({ punishmentId: id, text: text })
}

async function removePunishment(id) {
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

function hasPunishmentStart() {
    console.log("Привет мир");
    var job = new CronJob('0 0 0 * * *', async function() {
        console.log("Punishment is wroked");

        var  users = await User.find({ admin: false, baned: false, hasPunishment: true })

        var punishments = await Punishment.find({ status: true })
        
        var outArray = []; 
        var i = 0;
        var countNum = punishments.length;
        var max = punishments.length;
        var min = 0;
        while(i < countNum){
            var chislo = Math.floor((Math.random()*max) + min); 
            if(find(outArray, chislo)==0){
                outArray[i] = chislo;
                i++;
            }
            
        }
        
        function find(array, value) {
            for(var i=0; i<array.length; i++) {
                if (array[i] == value) return 1;
            }
            return 0;
        }

        console.log(punishments.length, "Punishment length");
        console.log(users.length, "User length");

        for ( let i = 0; i < users.length; i++ ) {
            // const randomIndex = getRandomInt(punishments.length)
            if ( users[i].taskIsDone === false && users[i].baned === false) {
                console.log("User task is not finish")
                await User.updateOne({ name: users[i].name }, { $set: { hasPunishment: true } })
                if(users[i].admin === false && users[i].baned === false) {
                    console.log("Punishment send message", outArray[i]);
                    await bot.telegram.sendMessage(users[i].chatId, `Вы не успели во время сдать!\nВаше наказание - "${punishments[outArray[i]].text}"`, getMenuWhenUserHavePunish())
                    await Punishment.updateOne({ _id: punishments[outArray[i]]._id }, { $set: {status: false} })
                }
            }
        }
    }, null, true)
    job.start();
}

function startSendTask() {
    console.log("StartSendTask");
  var job = new CronJob('0 0 12 * * *', async function() {
    console.log("Cron job worked");
    // get all Users
     var users = await User.find({ admin: false, baned: false, hasPunishment: false})
    // get all Tasks
    var tasks = await Task.find({ status: true })

    var outArray = []; 
    var i = 0;
    var countNum = tasks.length;
    var max = tasks.length;
    var min = 0;
    while(i < countNum){
        var chislo = Math.floor((Math.random()*max) + min); 
        if(find(outArray, chislo)==0){
            outArray[i] = chislo;
            i++;
        }
        
    }
    
    function find(array, value) {
        for(var i=0; i<array.length; i++) {
            if (array[i] == value) return 1;
        }
        return 0;
    }

    console.log(tasks.length, "Tasks length");
    console.log(users.length, "User length")

    for (let i = 0; i < users.length; i++) {
        console.log("User send Task");
        bot.telegram.sendMessage(users[i].chatId, `Задание на сегодня - "${tasks[outArray[i]].text}"${emoji.get('smile')}`, getMenuWhenUserNotHavePunish())
        await Task.updateOne({ _id: tasks[outArray[i]]._id }, { $set: {status: false} })
        await User.updateOne({ name: users[i].name }, { $set: { taskIsDone: false } })
    }
  }, null, true);
  
  job.start();
}

module.exports = {
    addTask,
    removeTask,
    removeUser,
    addPunishment,
    removePunishment,
    hasPunishmentStart,
    startSendTask
}