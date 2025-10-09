// Modèle Sequelize pour la table tb_types_abonnement
import { Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_types_abonnement
export class TypeAbonnement extends Model<
  InferAttributes<TypeAbonnement>,
  InferCreationAttributes<TypeAbonnement>
> {
  declare id_type_abonnement: CreationOptional<number>;
  declare nom_type: string;
  declare prix: number;
  declare duree_mois: number;
  declare description: string | null;
}

// Initialisation du modèle
TypeAbonnement.init(
  {
    id_type_abonnement: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom_type: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    prix: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    duree_mois: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, timestamps: false, tableName: 'tb_types_abonnement' }
);