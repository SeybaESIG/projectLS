import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
    process.env.DB_NAME || 'nom_de_la_base',
    process.env.DB_USER || 'utilisateur',
    process.env.DB_PASSWORD || 'mot_de_passe',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        port: Number(process.env.DB_PORT) || 5432,
        logging: false,
    }
);

export default sequelize;
