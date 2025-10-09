import sequelize from '../config/db.js';

// Fermeture propre de la connexion à la base de données après tous les tests
afterAll(async () => {
  await sequelize.close();
});
