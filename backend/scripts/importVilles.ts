import sequelize from '../config/db.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AirportRow {
    type: string;
    name: string;
    continent: string;
    iso_country: string;
    municipality: string;
    scheduled_service: string;
    icao_code: string;
    iata_code: string;
}

async function importVilles() {
    const startTime = Date.now();
    let villesCreated = 0;
    let villesExistantes = 0;
    let errors = 0;

    // Set pour éviter les doublons dans le CSV
    const villesProcessed = new Set<string>();

    try {
        await sequelize.authenticate();
        console.log('✅ Connexion à la base de données réussie!\n');

        // Lire le fichier CSV
        const csvPath = path.join(__dirname, '..', 'AeroportsClean - airports.csv');
        console.log(`📂 Lecture du fichier: ${csvPath}\n`);
        
        const fileContent = fs.readFileSync(csvPath, 'utf-8');
        const records: AirportRow[] = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        console.log(`📊 ${records.length} lignes trouvées dans le CSV\n`);
        console.log('🚀 Début de l\'import des villes...\n');

        for (let i = 0; i < records.length; i++) {
            const row = records[i];

            // Afficher la progression tous les 100 lignes
            if ((i + 1) % 100 === 0) {
                console.log(`   Progression: ${i + 1}/${records.length} lignes traitées...`);
            }

            // Ignorer si pas de municipality
            if (!row.municipality || row.municipality.trim() === '') {
                continue;
            }

            try {
                // 1. Trouver le pays via iso_country
                const [pays] = await sequelize.query(`
                    SELECT id_pays FROM tb_pays 
                    WHERE code_iso_pays = :code_iso
                    LIMIT 1;
                `, {
                    replacements: { code_iso: row.iso_country }
                });

                if (!pays || pays.length === 0) {
                    if (errors === 0) {
                        console.warn(`⚠️  Pays non trouvé pour code ISO: ${row.iso_country} (ligne ${i + 1})`);
                    }
                    errors++;
                    continue;
                }

                const id_pays = (pays[0] as any).id_pays;

                // 2. Créer une clé unique pour cette ville
                const villeKey = `${row.municipality}|${id_pays}`;

                // Si on a déjà traité cette ville dans ce script, on passe
                if (villesProcessed.has(villeKey)) {
                    villesExistantes++;
                    continue;
                }

                // 3. Vérifier si la ville existe dans la BDD
                const [villeExistante] = await sequelize.query(`
                    SELECT id_ville FROM tb_villes 
                    WHERE nom_ville = :nom_ville AND id_pays = :id_pays
                    LIMIT 1;
                `, {
                    replacements: { 
                        nom_ville: row.municipality,
                        id_pays: id_pays 
                    }
                });

                if (villeExistante && villeExistante.length > 0) {
                    // Ville existe déjà
                    villesExistantes++;
                    villesProcessed.add(villeKey);
                } else {
                    // 4. Créer la ville
                    await sequelize.query(`
                        INSERT INTO tb_villes (nom_ville, id_pays)
                        VALUES (:nom_ville, :id_pays);
                    `, {
                        replacements: {
                            nom_ville: row.municipality,
                            id_pays: id_pays
                        }
                    });

                    villesCreated++;
                    villesProcessed.add(villeKey);
                }

            } catch (error: any) {
                if (!error.message.includes('duplicate key')) {
                    console.error(`❌ Erreur ligne ${i + 1}:`, error.message);
                }
                errors++;
            }
        }

        // Résumé
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log('\n' + '='.repeat(80));
        console.log('📊 RÉSUMÉ DE L\'IMPORT DES VILLES');
        console.log('='.repeat(80));
        console.log(`✅ Villes créées:        ${villesCreated}`);
        console.log(`ℹ️  Villes déjà présentes: ${villesExistantes}`);
        console.log(`❌ Erreurs:              ${errors}`);
        console.log(`⏱️  Durée:                ${duration}s`);
        console.log('='.repeat(80));

        // Vérification finale
        const [villesCount] = await sequelize.query('SELECT COUNT(*) as count FROM tb_villes;');
        
        console.log('\n📈 Total de villes dans la base de données:');
        console.log(`   🏙️  ${villesCount[0].count} villes`);

        // Afficher quelques exemples
        console.log('\n📋 Exemples de villes créées (10 premières):');
        const [exemples] = await sequelize.query(`
            SELECT v.id_ville, v.nom_ville, p.nom_pays
            FROM tb_villes v
            JOIN tb_pays p ON v.id_pays = p.id_pays
            ORDER BY v.id_ville
            LIMIT 10;
        `);
        console.table(exemples);

        console.log('\n🎉 Import des villes terminé avec succès!');

    } catch (error) {
        console.error('❌ Erreur fatale:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

importVilles();

