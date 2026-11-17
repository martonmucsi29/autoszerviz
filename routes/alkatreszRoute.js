import pool from '../utils/db.js';
import { Router } from 'express';

const alkatreszrouter = Router();

alkatreszrouter.get('/fogyo', async (req, res) =>{
    let params = [];
    let szurok = [];

    const {min} = req.query;


})

export default alkatreszrouter;