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

interface Ville {
    id_ville: number;
    nom_ville: string;
    id_pays: number;
}

async function importAeroports() {
    const startTime = Date.now();
    let villesCreated = 0;
    let aeroportsCreated = 0;
    let skipped = 0;
    let errors = 0;

    // Map pour stocker les villes déjà créées (key: nom_ville + id_pays)
    const villesCache = new Map<string, number>();

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
        console.log('🚀 Début de l\'import...\n');

        for (let i = 0; i < records.length; i++) {
            const row = records[i];

            // Afficher la progression tous les 100 lignes
            if ((i + 1) % 100 === 0) {
                console.log(`   Progression: ${i + 1}/${records.length} lignes traitées...`);
            }

            // Vérifier que la ligne existe
            if (!row) {
                skipped++;
                continue;
            }

            // Ignorer si pas de code IATA
            if (!row.iata_code || row.iata_code.trim() === '') {
                skipped++;
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
                    console.warn(`⚠️  Pays non trouvé pour code ISO: ${row.iso_country} (ligne ${i + 1})`);
                    errors++;
                    continue;
                }

                const id_pays = (pays[0] as any).id_pays;

                // 2. Vérifier si la ville existe déjà dans le cache ou la BDD
                const cacheKey = `${row.municipality}_${id_pays}`;
                let id_ville: number;

                if (villesCache.has(cacheKey)) {
                    // Ville déjà créée dans cette session
                    id_ville = villesCache.get(cacheKey)!;
                } else {
                    // Chercher dans la BDD
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
                        id_ville = (villeExistante[0] as any).id_ville;
                        villesCache.set(cacheKey, id_ville);
                    } else {
                        // Créer la ville
                        const [result] = await sequelize.query(`
                            INSERT INTO tb_villes (nom_ville, id_pays)
                            VALUES (:nom_ville, :id_pays)
                            RETURNING id_ville;
                        `, {
                            replacements: {
                                nom_ville: row.municipality,
                                id_pays: id_pays
                            }
                        });

                        id_ville = (result[0] as any).id_ville;
                        villesCache.set(cacheKey, id_ville);
                        villesCreated++;
                    }
                }

                // 3. Créer l'aéroport
                await sequelize.query(`
                    INSERT INTO tb_aeroports (code_iata, nom_aeroport, id_ville)
                    VALUES (:code_iata, :nom_aeroport, :id_ville);
                `, {
                    replacements: {
                        code_iata: row.iata_code,
                        nom_aeroport: row.name,
                        id_ville: id_ville
                    }
                });

                aeroportsCreated++;

            } catch (error: any) {
                console.error(`❌ Erreur ligne ${i + 1}:`, error.message);
                errors++;
            }
        }

        // Résumé
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log('\n' + '='.repeat(80));
        console.log('📊 RÉSUMÉ DE L\'IMPORT');
        console.log('='.repeat(80));
        console.log(`✅ Villes créées:        ${villesCreated}`);
        console.log(`✅ Aéroports créés:      ${aeroportsCreated}`);
        console.log(`⏭️  Lignes ignorées:      ${skipped} (pas de code IATA)`);
        console.log(`❌ Erreurs:              ${errors}`);
        console.log(`⏱️  Durée:                ${duration}s`);
        console.log('='.repeat(80));

        // Vérification finale
        const [villesCount] = await sequelize.query('SELECT COUNT(*) as count FROM tb_villes;');
        const [aeroportsCount] = await sequelize.query('SELECT COUNT(*) as count FROM tb_aeroports;');
        
        console.log('\n📈 État final de la base de données:');
        console.log(`   - tb_villes: ${(villesCount[0] as any)?.count || 0} lignes`);
        console.log(`   - tb_aeroports: ${(aeroportsCount[0] as any)?.count || 0} lignes`);

        console.log('\n🎉 Import terminé avec succès!');

    } catch (error) {
        console.error('❌ Erreur fatale:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

importAeroports();

