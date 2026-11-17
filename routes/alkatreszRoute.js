import pool from '../utils/db.js';
import { Router } from 'express';

const alkatreszrouter = Router();

alkatreszrouter.get('/fogyo', async (req, res) =>{
    let params = [];
    let szurok = [];

    const {min} = req.query;

    let sql = `SELECT a.id, a.nev, a.ar, a.keszlet FROM munkalapok m JOIN ugyfelek u ON u.id = m.ugyfel_id JOIN felhasznalasok f ON f.munkalap_id = m.id JOIN alkatreszek a ON a.id = f.alkatresz_id`;

    if(min !== undefined && isNaN(Number(min))){
        res.status(400).json({hiba: "A megadott minimum nem szám."});
    }

    if(min){
        params.push(min);
        szurok.push(`a.keszlet < ?`);
    }
    else{
        sql += ` WHERE a.keszlet < 3`;
    }

    if(szurok.length > 0) {
        sql += ` WHERE ${szurok.join(' AND ')}`;
    }

    sql += ` ORDER BY a.keszlet ASC`;

    try{
        const [results] = await pool.query(sql, params);
        res.json({results});
    }
    catch (error){
        console.error(error);
        res.status(500).json({hiba: 'Hiba történt az adatbázis lekérdezése közben.'})
    }
});

export default alkatreszrouter;