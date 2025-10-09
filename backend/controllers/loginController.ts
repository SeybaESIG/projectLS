/*
import jwt from 'jsonwebtoken';
import { Utilisateur } from '../models/index.js';
import bcrypt from 'bcrypt';
import { userSchemas } from '../schemas/index.js';

export async function login(req, res, next) {
    const { error } = userSchemas.login.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { username, mot_de_passe } = req.body;
    const user = await Utilisateur.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(mot_de_passe, user.mot_de_passe))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id_util }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
}

 */