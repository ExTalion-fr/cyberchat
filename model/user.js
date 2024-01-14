const { DataTypes } = require('sequelize');
const sequelize = require('../bdd');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Synchroniser le modèle avec la base de données (créer la table si elle n'existe pas)
User.sync({ force: false }).then(() => {
    console.log('Le modèle a été synchronisé avec la base de données');
});

module.exports = { User };