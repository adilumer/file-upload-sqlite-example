const { Sequelize } = require("sequelize");

const adapter = new Sequelize(config.database);

async function initialize(callback){
  await adapter.sync({force: true});
  await callback();
}

module.exports = {
  adapter,
  initialize
};