import {
    DataTypes,
    Model,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    type ForeignKey,
} from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_msg_lectures
export class MsgLecture extends Model<InferAttributes<MsgLecture>, InferCreationAttributes<MsgLecture>> {
    declare id_lecture: CreationOptional<number>;
    declare id_expediteur: ForeignKey<number>;
    declare id_destinataire: ForeignKey<number>;
    declare id_annon: ForeignKey<number> | null;
    declare dernier_acces: CreationOptional<Date>;
}

// Initialisation du modèle
MsgLecture.init(
    {
        id_lecture: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_expediteur: { type: DataTypes.INTEGER, allowNull: false },
        id_destinataire: { type: DataTypes.INTEGER, allowNull: false },
        id_annon: { type: DataTypes.INTEGER, allowNull: true },
        dernier_acces: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { 
        sequelize, 
        timestamps: false, 
        tableName: 'tb_msg_lectures',
        indexes: [
            {
                unique: true,
                fields: ['id_expediteur', 'id_destinataire', 'id_annon']
            }
        ]
    }
);


