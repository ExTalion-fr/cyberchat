const { DataTypes } = require('sequelize');
const sequelize = require('../bdd');

const ConversationReaction = sequelize.define('ConversationReaction', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    idMessage: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    idUser: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    idReaction: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reaction: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Synchroniser le modèle avec la base de données (créer la table si elle n'existe pas)
ConversationReaction.sync({ force: false }).then(() => {
    console.log('Le modèle a été synchronisé avec la base de données');
});

module.exports = { ConversationReaction };