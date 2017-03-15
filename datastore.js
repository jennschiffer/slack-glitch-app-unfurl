var Sequelize = require('sequelize');
var sequelize = new Sequelize('database', 'username', 'password', {
                  dialect:'sqlite',
                  storage:'sqlite',
                });
var Token;

// Stores key-value pair in database
function set(key, value) {
  if (typeof(key) !== 'string')
    return Promise.reject(new DatastoreKeyNeedToBeStringException(key));
    
  return Token.find({ where: { key } })
    .then(token => {
      return token
        ? token.update({ value })
        : Token.create({ key, value });
    });
}

// Fetches the value matching key from the database
function get(key) {
  if (typeof(key) !== 'string') 
    return Promise.reject(new DatastoreKeyNeedToBeStringException(key));
  return Token.findOne({ where: { key } }).then(resolveValue);
}

function resolveValue(data) {
  return (data === null) ? null : data.value;
}

function connect() {
  return sequelize.authenticate()
    .then(_ => {
      console.log('Connection has been established successfully.');
      // define a new table 'token'
      Token = sequelize.define('token', {
          key: { 
            type: Sequelize.STRING 
          },
          value: { 
            type: Sequelize.STRING 
          },
      });
      
      return Token.sync();
    })
    .then(_ => Token)
    .catch(reason => {
      console.log('Unable to connect to the database: ', reason);
      // improve error result by throwing expection.
      throw new DatastoreUnknownException("connect", null, reason); 
    });
}

function DatastoreKeyNeedToBeStringException(keyObject) {
  this.type = this.constructor.name;
  this.description = 'Datastore can only use strings as keys, got ' + keyObject.constructor.name + ' instead.';
  this.key = keyObject;
}

function DatastoreUnknownException(method, args, ex) {
  this.type = this.constructor.name;
  this.description = 'An unknown error happened during the operation ' + method;
  this.method = method;
  this.args = args;
  this.error = ex;
}

var datastore = {
  set: set,
  get: get,
  connect: connect
};

module.exports = {
  data: datastore
};  