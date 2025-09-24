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
// Pas d'import de type de Annonce; utiliser un type primitif pour FK

// Modèle: tb_messages (classe typée)
export class Message extends Model<InferAttributes<Message>, InferCreationAttributes<Message>> {
    declare id_msg: CreationOptional<number>;
    declare id_expediteur: ForeignKey<Utilisateur['id_util']>;
    declare id_destinataire: ForeignKey<Utilisateur['id_util']>;
    declare id_annon: ForeignKey<number> | null;
    declare contenu: string;
    declare dateenvoi: Date | null;

    declare expediteur?: NonAttribute<Utilisateur>;
    declare destinataire?: NonAttribute<Utilisateur>;
}

Message.init(
    {
        id_msg: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_expediteur: { type: DataTypes.INTEGER, allowNull: false },
        id_destinataire: { type: DataTypes.INTEGER, allowNull: false },
        id_annon: { type: DataTypes.INTEGER, allowNull: true },
        contenu: { type: DataTypes.STRING(1000), allowNull: false },
        dateenvoi: { type: DataTypes.DATE, allowNull: true },
    },
    { sequelize, timestamps: false, tableName: 'tb_messages' }
);


