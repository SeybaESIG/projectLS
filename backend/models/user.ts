import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_utilisateurs
export const Utilisateur = sequelize.define(
    'Utilisateur',
    {
        id_util: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_ville: { type: DataTypes.INTEGER, allowNull: false },
        id_role: { type: DataTypes.INTEGER, allowNull: false },
        username: { type: DataTypes.STRING(255), allowNull: false, unique: true },
        nom: { type: DataTypes.STRING(100), allowNull: false },
        prenom: { type: DataTypes.STRING(100), allowNull: false },
        email: { type: DataTypes.STRING(255), allowNull: true, unique: true },
        tel: { type: DataTypes.STRING(50), allowNull: true },
        mot_de_passe: { type: DataTypes.STRING(255), allowNull: false },
        date_inscription: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        piece_id: { type: DataTypes.STRING(100), allowNull: true },
        photo: { type: DataTypes.STRING(255), allowNull: true },
        adresse: { type: DataTypes.STRING(255), allowNull: true },
        detail_adresse: { type: DataTypes.STRING(255), allowNull: true },
    },
    { timestamps: false, tableName: 'tb_utilisateurs' }
);


