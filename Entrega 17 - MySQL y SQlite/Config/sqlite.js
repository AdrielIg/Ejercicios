const sqlite3 = {
  client: 'sqlite3',
  connection: {
    filename: __dirname + '/../DB/messages.sqlite'
  },
  useNullAsDefault: false
};

module.exports = sqlite3;