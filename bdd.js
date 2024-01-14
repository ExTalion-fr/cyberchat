// sequelize.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('cyberchat', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

module.exports = sequelize;