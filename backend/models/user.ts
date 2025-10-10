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
import type { Role } from './role.js';
import type { Ville } from './ville.js';
import type { Message } from './message.js';
import type { Transaction } from './transaction.js';

// Modèle: tb_utilisateurs
export class Utilisateur extends Model<InferAttributes<Utilisateur>, InferCreationAttributes<Utilisateur>> {
    declare id_util: CreationOptional<number>;
    declare id_ville: ForeignKey<Ville['id_ville']>;
    declare id_role: ForeignKey<Role['id_role']>;
    declare username: string;
    declare nom: string;
    declare prenom: string;
    declare email: string | null;
    declare tel: string | null;
    declare mot_de_passe: string;
    declare date_inscription: CreationOptional<Date>;
    declare piece_id: string | null;
    declare photo: string | null;
    declare adresse: string | null;
    declare detail_adresse: string | null;
    declare note_moyenne: CreationOptional<string>;

    // Champs d'association
    declare Role?: NonAttribute<Role>;
    declare Ville?: NonAttribute<Ville>;
    declare messagesExpedies?: NonAttribute<Message[]>;
    declare messagesRecus?: NonAttribute<Message[]>;
    declare transactionsPayeur?: NonAttribute<Transaction[]>;
    declare transactionsReceveur?: NonAttribute<Transaction[]>;

    // Masquer le mot de passe dans toutes les réponses JSON
    toJSON() {
        const values: any = { ...this.get() };
        delete values.mot_de_passe;
        return values;
    }
}

// Initialisation du modèle
Utilisateur.init(
    {
        id_util: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_ville: { type: DataTypes.INTEGER, allowNull: false },
        id_role: { type: DataTypes.INTEGER, allowNull: false },
        username: { type: DataTypes.STRING(255), allowNull: false, unique: true },
        nom: { type: DataTypes.STRING(100), allowNull: false },
        prenom: { type: DataTypes.STRING(100), allowNull: false },
        email: { type: DataTypes.STRING(255), allowNull: true, unique: true },
        tel: { type: DataTypes.STRING(50), allowNull: true, unique: true },
        mot_de_passe: { type: DataTypes.STRING(255), allowNull: false },
        date_inscription: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        piece_id: { type: DataTypes.STRING(100), allowNull: true },
        photo: { type: DataTypes.STRING(255), allowNull: true },
        adresse: { type: DataTypes.STRING(255), allowNull: true },
        detail_adresse: { type: DataTypes.STRING(255), allowNull: true },
        note_moyenne: { type: DataTypes.DECIMAL(3, 2), allowNull: false, defaultValue: 0 },
    },
    { sequelize, timestamps: false, tableName: 'tb_utilisateurs' }
);


