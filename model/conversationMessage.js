const { DataTypes } = require('sequelize');
const sequelize = require('../bdd');

const ConversationMessage = sequelize.define('ConversationMessage', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    idConversation: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    idUser: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Synchroniser le modèle avec la base de données (créer la table si elle n'existe pas)
ConversationMessage.sync({ force: false }).then(() => {
    console.log('Le modèle a été synchronisé avec la base de données');
});

module.exports = { ConversationMessage };