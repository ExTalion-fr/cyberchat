
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('extalion_cyberchat', 'extalion', 'xCyctmmLFLZf8@J', {
    host: 'mysql-extalion.alwaysdata.net',
    dialect: 'mysql'
});

module.exports = sequelize;