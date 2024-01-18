const { DataTypes } = require('sequelize');
const sequelize = require('../bdd');

const Conversation = sequelize.define('Conversation', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Synchroniser le modèle avec la base de données (créer la table si elle n'existe pas)
Conversation.sync({ force: false }).then(() => {
    console.log('Le modèle a été synchronisé avec la base de données');
});

module.exports = { Conversation };