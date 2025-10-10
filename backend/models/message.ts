import {
    DataTypes,
    Model,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    type ForeignKey,
    type NonAttribute,
} from 'sequelize';
import sequelize from '../config/db.js';
import type { Utilisateur } from './user.js';

// Modèle: tb_messages
export class Message extends Model<InferAttributes<Message>, InferCreationAttributes<Message>> {
    declare id_msg: CreationOptional<number>;
    declare id_expediteur: ForeignKey<Utilisateur['id_util']>;
    declare id_destinataire: ForeignKey<Utilisateur['id_util']>;
    declare id_annon: ForeignKey<number> | null;
    declare contenu: string;
    declare dateenvoi: CreationOptional<Date>;
    declare url_image: string | null;

    declare expediteur?: NonAttribute<Utilisateur>;
    declare destinataire?: NonAttribute<Utilisateur>;
}

// Initialisation du modèle
Message.init(
    {
        id_msg: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_expediteur: { type: DataTypes.INTEGER, allowNull: false },
        id_destinataire: { type: DataTypes.INTEGER, allowNull: false },
        id_annon: { type: DataTypes.INTEGER, allowNull: true },
        contenu: { type: DataTypes.STRING(1000), allowNull: false },
        dateenvoi: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        url_image: { type: DataTypes.STRING(500), allowNull: true },
    },
    { sequelize, timestamps: false, tableName: 'tb_messages' }
);


