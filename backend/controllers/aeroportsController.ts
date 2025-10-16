import type { Request, Response, NextFunction } from 'express';
import { Aeroport } from '../models/index.js';
import { Op } from 'sequelize';
import { getAeroportsCache } from '../services/cacheService.js';

// Récupérer tous les aéroports (avec cache Redis - 24h)
export const getAllAeroports = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const aeroports = await getAeroportsCache(() => Aeroport.findAll());
        res.json(aeroports);
    } catch (error) {
        next(error);
    }
};

// Récupérer un aéroport par son ID
export const getAeroportById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const aeroport = await Aeroport.findByPk(req.params.id);
        if (!aeroport) return res.status(404).json({ message: 'Aéroport introuvable' });
        res.json(aeroport);
    } catch (error) {
        next(error);
    }
};

// Rechercher des aéroports (ex: /api/aeroports/search?name=Bamako&ville=Paris)
// Paramètres: name (nom_aeroport), ville (nom_ville)
export const searchAeroport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, ville } = req.query;
        
        if (!name && !ville) {
            return res.status(400).json({ message: 'Au moins un paramètre de recherche est requis (name, ville)' });
        }
        
        const whereClause: any = {};
        const includeClause: any[] = [];
        
        if (name) {
            whereClause.nom_aeroport = { [Op.iLike]: `%${name}%` };
        }
        
        // Importer Ville pour pouvoir faire la recherche
        const { Ville } = await import('../models/index.js');
        
        if (ville) {
            includeClause.push({
                model: Ville,
                where: {
                    nom_ville: { [Op.iLike]: `%${ville}%` }
                },
                required: true
            });
        } else {
            includeClause.push(Ville);
        }
        
        const aeroports = await Aeroport.findAll({
            where: whereClause,
            include: includeClause
        });
        
        res.json(aeroports);
    } catch (error) {
        next(error);
    }
};

/*
Additional controller for external API call

import type { Request, Response } from 'express';
import axios from 'axios';

export const getExternalAeroport = async (req: Request, res: Response) => {
    const { iata_code } = req.query;
    const apiKey = process.env.AIRLABS_API_KEY; // Store your API key in an environment variable
    try {
        const response = await axios.get(`https://airlabs.co/api/v9/airports`, {
            params: { iata_code, api_key: apiKey }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des données de l\'API externe' });
    }
};

*/