const Discord = require("discord.js");
const bot = new Discord.Client();
const fs = require('fs');

const DBConnector = require("./database.js");
const Updater = require("./updater.js");
const handleCommand = require("./commands.js");

var data = fs.readFileSync('./config.json');
var config;
var db;
var dbUpdater;
var requiredPermissions = ['SEND_MESSAGES'];
var updateInterval = 60 * 1000

function setup() {
	updateInterval = config.updateInterval * 1000;
    db = new DBConnector(config.dbUrl);
    dbUpdater = new Updater(bot, db, config.updateInterval);
}

//Logging
function logUserState() {
    dbUpdater.updateStats();
	setTimeout(logUserState, updateInterval);
}

//Message Handling
bot.on('message', msg => {
  if (msg.content.startsWith(config.commandPrefix)) {
    handleCommand(msg, bot, db, config);
  }
});

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.username}!`);
  var invitePromise = bot.generateInvite(requiredPermissions);
  invitePromise.then(function (link) {
  	console.log('Add me to your server using this link:');
  	console.log(link);
  });
});

try {
    config = JSON.parse(data);
    
    setup();

    bot.login(config.token);
    setTimeout(logUserState, updateInterval);
}
catch (err) {
    console.log(err);
}