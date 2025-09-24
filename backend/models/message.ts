import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_messages
export const Message = sequelize.define(
    'Message',
    {
        id_msg: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_expediteur: { type: DataTypes.INTEGER, allowNull: false },
        id_destinataire: { type: DataTypes.INTEGER, allowNull: false },
        id_annon: { type: DataTypes.INTEGER, allowNull: true },
        contenu: { type: DataTypes.STRING(1000), allowNull: false },
        dateenvoi: { type: DataTypes.DATE, allowNull: true },
    },
    { timestamps: false, tableName: 'tb_messages' }
);


