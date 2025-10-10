// Déclaration centralisée des associations entre modèles
import { Utilisateur } from './user.js';
import { Role } from './role.js';
import { Ville } from './ville.js';
import { Pays } from './pays.js';
import { Abonnement } from './abonnement.js';
import { TypeAbonnement } from './typeAbonnement.js';
import { HistoriqueAbonnement } from './historiqueAbonnement.js';
import { Annonce } from './annonce.js';
import { Aeroport } from './aeroport.js';
import { Message } from './message.js';
import { MsgLecture } from './msgLecture.js';
import { Transaction } from './transaction.js';
import { Paiement } from './paiement.js';
import { Evaluation } from './evaluation.js';
import { HistoriqueAnnonce } from './historiqueAnnonce.js';

export function initAssociations(): void {
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
    // id_util unique => un‑à‑un côté Utilisateur
    Utilisateur.hasOne(Abonnement, { foreignKey: 'id_util' });

    Abonnement.belongsTo(TypeAbonnement, { foreignKey: 'id_type_abonnement' });
    TypeAbonnement.hasMany(Abonnement, { foreignKey: 'id_type_abonnement' });

    // HistoriqueAbonnement -> TypeAbonnement
    HistoriqueAbonnement.belongsTo(TypeAbonnement, { foreignKey: 'id_type_abonnement' });
    TypeAbonnement.hasMany(HistoriqueAbonnement, { foreignKey: 'id_type_abonnement' });

    // Annonce -> Utilisateur
    Annonce.belongsTo(Utilisateur, { foreignKey: 'id_util' });
    Utilisateur.hasMany(Annonce, { foreignKey: 'id_util' });

    // Annonce -> Aeroport (départ et arrivée)
    Annonce.belongsTo(Aeroport, { as: 'aeroportDepart', foreignKey: 'id_aerodep' });
    Annonce.belongsTo(Aeroport, { as: 'aeroportArrivee', foreignKey: 'id_aeroarr' });
    Aeroport.hasMany(Annonce, { as: 'annoncesDepart', foreignKey: 'id_aerodep' });
    Aeroport.hasMany(Annonce, { as: 'annoncesArrivee', foreignKey: 'id_aeroarr' });

    // Aeroport -> Ville
    Aeroport.belongsTo(Ville, { foreignKey: 'id_ville' });
    Ville.hasMany(Aeroport, { foreignKey: 'id_ville' });

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

    // MsgLecture -> Utilisateur (expediteur et destinataire), Annonce
    MsgLecture.belongsTo(Utilisateur, { as: 'expediteur', foreignKey: 'id_expediteur' });
    MsgLecture.belongsTo(Utilisateur, { as: 'destinataire', foreignKey: 'id_destinataire' });
    MsgLecture.belongsTo(Annonce, { foreignKey: 'id_annon' });
    
    Utilisateur.hasMany(MsgLecture, { as: 'lecturesEnvoyees', foreignKey: 'id_expediteur' });
    Utilisateur.hasMany(MsgLecture, { as: 'lecturesRecues', foreignKey: 'id_destinataire' });
    Annonce.hasMany(MsgLecture, { foreignKey: 'id_annon' });
}


