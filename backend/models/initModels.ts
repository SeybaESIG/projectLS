import { DataTypes, Model, Sequelize } from 'sequelize';
import sequelize from '../config/db.js';

// Aide: options cohérentes pour tous les modèles
const noTimestamps = { timestamps: false } as const;

// tb_abonnements
export const Abonnement = sequelize.define(
    'Abonnement',
    {
        id_abonnement: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_util: { type: DataTypes.INTEGER, allowNull: false, unique: true },
        id_type_abonnement: { type: DataTypes.INTEGER, allowNull: false },
        date_debut: { type: DataTypes.DATE, allowNull: false },
        date_fin: { type: DataTypes.DATE, allowNull: false },
    },
    { ...noTimestamps, tableName: 'tb_abonnements' }
);

// tb_historique_abonnements
export const HistoriqueAbonnement = sequelize.define(
    'HistoriqueAbonnement',
    {
        id_histo_abo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_type_abonnement: { type: DataTypes.INTEGER, allowNull: false },
        nom_type: { type: DataTypes.STRING(100), allowNull: false },
        prix: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        duree_mois: { type: DataTypes.INTEGER, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        action_histo: { type: DataTypes.STRING(10), allowNull: false },
    },
    { ...noTimestamps, tableName: 'tb_historique_abonnements' }
);

// tb_pays
export const Pays = sequelize.define(
    'Pays',
    {
        id_pays: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nom_pays: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        code_iso_pays: { type: DataTypes.STRING(10), allowNull: true, unique: true },
    },
    { ...noTimestamps, tableName: 'tb_pays' }
);

// tb_roles
export const Role = sequelize.define(
    'Role',
    {
        id_role: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nom_role: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        description_role: { type: DataTypes.TEXT, allowNull: true },
    },
    { ...noTimestamps, tableName: 'tb_roles' }
);

// tb_utilisateurs
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
    { ...noTimestamps, tableName: 'tb_utilisateurs' }
);

// tb_achats (PK composite id_util + id_annon)
export const Achat = sequelize.define(
    'Achat',
    {
        id_util: { type: DataTypes.INTEGER, primaryKey: true },
        id_annon: { type: DataTypes.INTEGER, primaryKey: true },
        venteid: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true },
        datevente: { type: DataTypes.DATE, allowNull: true },
    },
    { ...noTimestamps, tableName: 'tb_achats' }
);

// tb_aeroports (PK composite id_ville + id_aeroport)
export const Aeroport = sequelize.define(
    'Aeroport',
    {
        id_ville: { type: DataTypes.INTEGER, primaryKey: true },
        id_aeroport: { type: DataTypes.INTEGER, primaryKey: true },
        code_iata: { type: DataTypes.STRING(10), allowNull: false, unique: true },
        nom_aeroport: { type: DataTypes.STRING(255), allowNull: false },
    },
    { ...noTimestamps, tableName: 'tb_aeroports' }
);

// tb_annonces
export const Annonce = sequelize.define(
    'Annonce',
    {
        id_annon: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_util: { type: DataTypes.INTEGER, allowNull: false },
        id_ville_dep: { type: DataTypes.INTEGER, allowNull: false },
        id_aerodep: { type: DataTypes.INTEGER, allowNull: false },
        id_ville_arr: { type: DataTypes.INTEGER, allowNull: false },
        id_aeroarr: { type: DataTypes.INTEGER, allowNull: false },
        description: { type: DataTypes.STRING(255), allowNull: true },
        prix: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        datedepart: { type: DataTypes.DATE, allowNull: true },
        datearrivee: { type: DataTypes.DATE, allowNull: true },
        datepublication: { type: DataTypes.DATE, allowNull: true },
        statut: { type: DataTypes.STRING(50), allowNull: true },
        titre: { type: DataTypes.STRING(100), allowNull: true },
    },
    { ...noTimestamps, tableName: 'tb_annonces' }
);

// tb_evaluations (PK composite id_util_donne + id_util_recoit + id_transa)
export const Evaluation = sequelize.define(
    'Evaluation',
    {
        id_util_donne: { type: DataTypes.INTEGER, primaryKey: true },
        id_util_recoit: { type: DataTypes.INTEGER, primaryKey: true },
        id_transa: { type: DataTypes.INTEGER, primaryKey: true },
        note: { type: DataTypes.DECIMAL, allowNull: true },
        commentaire: { type: DataTypes.STRING(500), allowNull: true },
        date: { type: DataTypes.DATE, allowNull: true },
        note_moyenne: { type: DataTypes.DECIMAL, allowNull: true },
    },
    { ...noTimestamps, tableName: 'tb_evaluations' }
);

// tb_historique_annonces
export const HistoriqueAnnonce = sequelize.define(
    'HistoriqueAnnonce',
    {
        id_histo_annon: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_annon: { type: DataTypes.INTEGER, allowNull: false },
        id_util: { type: DataTypes.INTEGER, allowNull: false },
        id_aerodep: { type: DataTypes.INTEGER, allowNull: false },
        id_aeroarr: { type: DataTypes.INTEGER, allowNull: false },
        description: { type: DataTypes.STRING(255), allowNull: true },
        prix: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        datedepart: { type: DataTypes.DATE, allowNull: true },
        datearrivee: { type: DataTypes.DATE, allowNull: true },
        datepublication: { type: DataTypes.DATE, allowNull: true },
        statut: { type: DataTypes.STRING(50), allowNull: true },
        titre: { type: DataTypes.STRING(100), allowNull: true },
        action_histo: { type: DataTypes.STRING(10), allowNull: false },
    },
    { ...noTimestamps, tableName: 'tb_historique_annonces' }
);

// tb_messages
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
    { ...noTimestamps, tableName: 'tb_messages' }
);

// tb_paiements
export const Paiement = sequelize.define(
    'Paiement',
    {
        id_paie: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_transa: { type: DataTypes.INTEGER, allowNull: false },
        type: { type: DataTypes.STRING(50), allowNull: false },
        statut: { type: DataTypes.STRING(50), allowNull: false },
        date: { type: DataTypes.DATE, allowNull: true },
    },
    { ...noTimestamps, tableName: 'tb_paiements' }
);

// tb_transactions
export const Transaction = sequelize.define(
    'Transaction',
    {
        id_transa: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_payeur: { type: DataTypes.INTEGER, allowNull: false },
        id_receveur: { type: DataTypes.INTEGER, allowNull: false },
        id_annon: { type: DataTypes.INTEGER, allowNull: true },
        montant: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        statut: { type: DataTypes.STRING(50), allowNull: false },
        date: { type: DataTypes.DATE, allowNull: true },
    },
    { ...noTimestamps, tableName: 'tb_transactions' }
);

// tb_types_abonnement
export const TypeAbonnement = sequelize.define(
    'TypeAbonnement',
    {
        id_type_abonnement: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nom_type: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        prix: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        duree_mois: { type: DataTypes.INTEGER, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
    },
    { ...noTimestamps, tableName: 'tb_types_abonnement' }
);

// tb_villes
export const Ville = sequelize.define(
    'Ville',
    {
        id_ville: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nom_ville: { type: DataTypes.STRING(100), allowNull: false },
        code_postal: { type: DataTypes.STRING(20), allowNull: true },
        id_pays: { type: DataTypes.INTEGER, allowNull: false },
    },
    { ...noTimestamps, tableName: 'tb_villes' }
);

// Remarque : les associations sont définies plus bas dans ce fichier.

export type InitModels = {
    Abonnement: typeof Abonnement;
    HistoriqueAbonnement: typeof HistoriqueAbonnement;
    Pays: typeof Pays;
    Role: typeof Role;
    Utilisateur: typeof Utilisateur;
    Achat: typeof Achat;
    Aeroport: typeof Aeroport;
    Annonce: typeof Annonce;
    Evaluation: typeof Evaluation;
    HistoriqueAnnonce: typeof HistoriqueAnnonce;
    Message: typeof Message;
    Paiement: typeof Paiement;
    Transaction: typeof Transaction;
    TypeAbonnement: typeof TypeAbonnement;
    Ville: typeof Ville;
};

// -------------------------------
// Associations (relations clés étrangères)
// -------------------------------

// Utilisateur -> Role, Ville
Utilisateur.belongsTo(Role, { foreignKey: 'id_role' });
Role.hasMany(Utilisateur, { foreignKey: 'id_role' });

Utilisateur.belongsTo(Ville, { foreignKey: 'id_ville' });
Ville.hasMany(Utilisateur, { foreignKey: 'id_ville' });

// Ville -> Pays
Ville.belongsTo(Pays, { foreignKey: 'id_pays' });
Pays.hasMany(Ville, { foreignKey: 'id_pays' });

// Abonnement -> Utilisateur, TypeAbonnement
Abonnement.belongsTo(Utilisateur, { foreignKey: 'id_util' });
// id_util unique implique une relation un‑à‑un côté Utilisateur
Utilisateur.hasOne(Abonnement, { foreignKey: 'id_util' });

Abonnement.belongsTo(TypeAbonnement, { foreignKey: 'id_type_abonnement' });
TypeAbonnement.hasMany(Abonnement, { foreignKey: 'id_type_abonnement' });

// HistoriqueAbonnement -> TypeAbonnement
HistoriqueAbonnement.belongsTo(TypeAbonnement, { foreignKey: 'id_type_abonnement' });
TypeAbonnement.hasMany(HistoriqueAbonnement, { foreignKey: 'id_type_abonnement' });

// Annonce -> Utilisateur
Annonce.belongsTo(Utilisateur, { foreignKey: 'id_util' });
Utilisateur.hasMany(Annonce, { foreignKey: 'id_util' });

// Aeroport -> Ville
Aeroport.belongsTo(Ville, { foreignKey: 'id_ville' });
Ville.hasMany(Aeroport, { foreignKey: 'id_ville' });

// NOTE : tb_annonces référence les aéroports de départ/arrivée via (id_ville_dep, id_aerodep) et (id_ville_arr, id_aeroarr).
// Sequelize ne gère pas nativement les clés étrangères composites, on garde donc ces champs tels quels (sans contrainte ORM).

// Message -> Utilisateur (expéditeur/destinataire), Annonce
Message.belongsTo(Utilisateur, { as: 'expediteur', foreignKey: 'id_expediteur' });
Utilisateur.hasMany(Message, { as: 'messagesExpedies', foreignKey: 'id_expediteur' });

Message.belongsTo(Utilisateur, { as: 'destinataire', foreignKey: 'id_destinataire' });
Utilisateur.hasMany(Message, { as: 'messagesRecus', foreignKey: 'id_destinataire' });

Message.belongsTo(Annonce, { foreignKey: 'id_annon' });
Annonce.hasMany(Message, { foreignKey: 'id_annon' });

// Transaction -> Utilisateur (payeur/receveur), Annonce
Transaction.belongsTo(Utilisateur, { as: 'payeur', foreignKey: 'id_payeur' });
Utilisateur.hasMany(Transaction, { as: 'transactionsPayeur', foreignKey: 'id_payeur' });

Transaction.belongsTo(Utilisateur, { as: 'receveur', foreignKey: 'id_receveur' });
Utilisateur.hasMany(Transaction, { as: 'transactionsReceveur', foreignKey: 'id_receveur' });

Transaction.belongsTo(Annonce, { foreignKey: 'id_annon' });
Annonce.hasMany(Transaction, { foreignKey: 'id_annon' });

// Paiement -> Transaction
Paiement.belongsTo(Transaction, { foreignKey: 'id_transa' });
Transaction.hasMany(Paiement, { foreignKey: 'id_transa' });

// Evaluation -> Utilisateur (donne/reçoit), Transaction
Evaluation.belongsTo(Utilisateur, { as: 'utilDonne', foreignKey: 'id_util_donne' });
Utilisateur.hasMany(Evaluation, { as: 'evaluationsDonnees', foreignKey: 'id_util_donne' });

Evaluation.belongsTo(Utilisateur, { as: 'utilRecoit', foreignKey: 'id_util_recoit' });
Utilisateur.hasMany(Evaluation, { as: 'evaluationsRecues', foreignKey: 'id_util_recoit' });

Evaluation.belongsTo(Transaction, { foreignKey: 'id_transa' });
Transaction.hasMany(Evaluation, { foreignKey: 'id_transa' });

// HistoriqueAnnonce -> Annonce, Utilisateur
HistoriqueAnnonce.belongsTo(Annonce, { foreignKey: 'id_annon' });
Annonce.hasMany(HistoriqueAnnonce, { foreignKey: 'id_annon' });

HistoriqueAnnonce.belongsTo(Utilisateur, { foreignKey: 'id_util' });
Utilisateur.hasMany(HistoriqueAnnonce, { foreignKey: 'id_util' });

// Achat -> Utilisateur, Annonce
Achat.belongsTo(Utilisateur, { foreignKey: 'id_util' });
Utilisateur.hasMany(Achat, { foreignKey: 'id_util' });

Achat.belongsTo(Annonce, { foreignKey: 'id_annon' });
Annonce.hasMany(Achat, { foreignKey: 'id_annon' });


