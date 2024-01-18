const { DataTypes } = require('sequelize');
const sequelize = require('../bdd');

const ConversationUser = sequelize.define('ConversationUser', {
    idConversation: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    idUser: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    }
});

// Synchroniser le modèle avec la base de données (créer la table si elle n'existe pas)
ConversationUser.sync({ force: false }).then(() => {
    console.log('Le modèle a été synchronisé avec la base de données');
});

module.exports = { ConversationUser };