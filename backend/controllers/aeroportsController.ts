import type { Request, Response, NextFunction } from 'express';
import { Aeroport } from '../models/index.js';

// Récupérer tous les aéroports
export const getAllAeroports = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const aeroports = await Aeroport.findAll();
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