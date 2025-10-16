# 📊 Liste complète des indexes de la base de données

## Résumé

- **Total indexes explicites** : **48 indexes** ✅
- **Tables avec indexes** : **15/15** ✅
- **Coverage** : 100%

---

## 📋 Indexes par table

### 1. **tb_roles** (1 index)
- `idx_roles_nom` → `nom_role`

### 2. **tb_pays** (2 indexes)
- `idx_pays_nom` → `nom_pays`
- `idx_pays_code` → `code_iso_pays`

### 3. **tb_villes** (2 indexes)
- `idx_villes_pays` → `id_pays` (FK)
- `idx_villes_nom` → `nom_ville`

### 4. **tb_aeroports** (2 indexes)
- `idx_aeroports_nom` → `nom_aeroport`
- `idx_aeroports_code_iata` → `code_iata`
- *(Note: `id_ville` déjà dans PRIMARY KEY composite)*

### 5. **tb_utilisateurs** (4 indexes)
- `idx_utilisateurs_role` → `id_role` (FK)
- `idx_utilisateurs_ville` → `id_ville` (FK)
- `idx_utilisateurs_date_inscription` → `date_inscription DESC`
- `idx_utilisateurs_note_moyenne` → `note_moyenne DESC`
- *(+ UNIQUE auto: email, tel, username)*

### 6. **tb_annonces** (7 indexes) ⭐
- `idx_annonces_utilisateur` → `id_util` (FK)
- `idx_annonces_aerodep` → `id_aerodep` (FK)
- `idx_annonces_aeroarr` → `id_aeroarr` (FK)
- `idx_annonces_statut` → `statut`
- `idx_annonces_datedepart` → `datedepart`
- `idx_annonces_datepublication` → `datepublication DESC`
- `idx_annonces_prix` → `prix`

### 7. **tb_historique_annonces** (4 indexes)
- `idx_histo_annonces_annonce` → `id_annon` (FK)
- `idx_histo_annonces_utilisateur` → `id_util` (FK)
- `idx_histo_annonces_action` → `action_histo`
- `idx_histo_annonces_date` → `datepublication DESC`

### 8. **tb_types_abonnement** (2 indexes)
- `idx_types_abo_prix` → `prix`
- `idx_types_abo_duree` → `duree_mois`
- *(+ UNIQUE auto: nom_type)*

### 9. **tb_abonnements** (3 indexes)
- `idx_abonnements_type` → `id_type_abonnement` (FK)
- `idx_abonnements_date_debut` → `date_debut`
- `idx_abonnements_date_fin` → `date_fin`
- *(+ UNIQUE auto: id_util)*

### 10. **tb_historique_abonnements** (2 indexes)
- `idx_histo_abo_type` → `id_type_abonnement` (FK)
- `idx_histo_abo_action` → `action_histo`

### 11. **tb_messages** (3 indexes)
- `idx_messages_expediteur_destinataire` → `(id_expediteur, id_destinataire)` (composite)
- `idx_messages_annonce` → `id_annon` (FK)
- `idx_messages_dateenvoi` → `dateenvoi DESC`

### 12. **tb_msg_lectures** (2 indexes)
- `idx_msg_lectures_destinataire` → `id_destinataire` (FK)
- `idx_msg_lectures_conversation` → `(id_expediteur, id_destinataire, id_annon)` (composite)

### 13. **tb_evaluations** (5 indexes)
- `idx_evaluations_recoit` → `id_util_recoit` (FK)
- `idx_evaluations_donne` → `id_util_donne` (FK)
- `idx_evaluations_transaction` → `id_transa` (FK)
- `idx_evaluations_date` → `date DESC`
- `idx_evaluations_note` → `note DESC`

### 14. **tb_transactions** (5 indexes)
- `idx_transactions_payeur` → `id_payeur` (FK)
- `idx_transactions_receveur` → `id_receveur` (FK)
- `idx_transactions_annonce` → `id_annon` (FK)
- `idx_transactions_date` → `date DESC`
- `idx_transactions_statut` → `statut`

### 15. **tb_paiements** (4 indexes)
- `idx_paiements_transaction` → `id_transa` (FK)
- `idx_paiements_date` → `date DESC`
- `idx_paiements_statut` → `statut`
- `idx_paiements_stripe_intent` → `stripe_payment_intent_id` (pour webhooks)

---

## 🎯 Types d'indexes

### Par catégorie :

| Type | Nombre | Exemples |
|------|--------|----------|
| **Foreign Keys** | 23 | id_util, id_pays, id_transa, etc. |
| **Dates** | 11 | datedepart, datepublication, date_inscription |
| **Statuts** | 4 | statut (annonces, transactions, paiements, msg) |
| **Noms/Codes** | 6 | nom_ville, code_iata, nom_role |
| **Montants/Prix** | 3 | prix, montant, note_moyenne |
| **Composites** | 2 | (expediteur, destinataire), (expediteur, destinataire, annonce) |

### Index DESC (tri décroissant) :
- Toutes les dates : `DESC` (les plus récentes en premier)
- `note_moyenne DESC` (meilleurs utilisateurs en premier)
- `note DESC` (meilleures évaluations en premier)

---

## 🚀 Impact Performance

### Avant indexes (tables sans indexes)
```sql
SELECT * FROM tb_annonces WHERE statut = 'active';
→ FULL TABLE SCAN (lent si 100k+ lignes)
```

### Après indexes
```sql
SELECT * FROM tb_annonces WHERE statut = 'active';
→ INDEX SCAN sur idx_annonces_statut (rapide!)
```

### Gains estimés :

| Taille DB | Sans indexes | Avec indexes | Gain |
|-----------|--------------|--------------|------|
| 1k lignes | ~10ms | ~2ms | **5x** |
| 10k lignes | ~100ms | ~5ms | **20x** |
| 100k lignes | ~1000ms | ~10ms | **100x** |
| 1M lignes | ~10s | ~50ms | **200x** 🚀 |

---

## ✅ Vérification des indexes

Pour vérifier les indexes d'une table :

```sql
\d tb_annonces
```

Pour lister tous les indexes :

```sql
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## 📈 Recommandations futures

### Si l'application grandit (100k+ utilisateurs) :

1. **Indexes partiels** (pour optimiser les requêtes fréquentes) :
```sql
-- Seulement les annonces actives
CREATE INDEX idx_annonces_active ON tb_annonces(id_util, datepublication DESC) 
WHERE statut = 'active';
```

2. **Indexes BRIN** (pour les grandes tables avec dates séquentielles) :
```sql
CREATE INDEX idx_annonces_datepublication_brin ON tb_annonces 
USING BRIN (datepublication);
```

3. **Indexes full-text** (pour la recherche textuelle) :
```sql
CREATE INDEX idx_annonces_fulltext ON tb_annonces 
USING GIN (to_tsvector('french', titre || ' ' || description));
```

4. **VACUUM ANALYZE** régulier pour maintenir les performances

---

## ⚠️ Maintenance

### Surveiller les indexes :

```sql
-- Taille des indexes
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;

-- Indexes inutilisés
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE '%pkey%';
```

---

**✅ Tous les indexes sont maintenant en place ! Performance optimale garantie ! 🚀**




