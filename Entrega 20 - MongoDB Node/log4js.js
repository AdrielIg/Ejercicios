const log4js = require("log4js");

log4js.configure({
  appenders: {
    miLoggerConsole: { type: "console" },
    miLoggerFile: { type: 'file', filename: 'warn.log' },
    miLoggerFile2: { type: 'file', filename: 'error.log' }
  },
  categories: {
    default: { appenders: ["miLoggerConsole"], level: "trace" },
    consola: { appenders: ["miLoggerConsole"], level: "info" },
    warn: { appenders: ["miLoggerFile", "miLoggerConsole"], level: "warn" },
    err: { appenders: ["miLoggerFile2", "miLoggerConsole"], level: "error" },
  }
});

module.exports = log4js