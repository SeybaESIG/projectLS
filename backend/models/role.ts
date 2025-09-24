import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from 'sequelize';
import sequelize from '../config/db.js';
import type { Utilisateur } from './user.js';

// Modèle: tb_roles (classe typée)
export class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
    declare id_role: CreationOptional<number>;
    declare nom_role: string;
    declare description_role: string | null;

    declare Utilisateurs?: NonAttribute<Utilisateur[]>;
}

Role.init(
    {
        id_role: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nom_role: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        description_role: { type: DataTypes.TEXT, allowNull: true },
    },
    { sequelize, timestamps: false, tableName: 'tb_roles' }
);


