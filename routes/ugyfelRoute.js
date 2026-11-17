import pool from '../utils/db.js';
import { Router } from 'express';

const ugyfelrouter = Router();

ugyfelrouter.get('/', async (req, res) => {
    let sql = `SELECT u.id, u.nev, u.telefon, COUNT(DISTINCT m.id) AS munkalapDb, ROUND((m.munkaora * 12000) + SUM(a.ar * f.db), 0) AS osszesKoltes FROM munkalapok m RIGHT JOIN ugyfelek u ON u.id = m.ugyfel_id LEFT JOIN felhasznalasok f ON f.munkalap_id = m.id LEFT JOIN alkatreszek a ON a.id = f.alkatresz_id GROUP BY u.nev ORDER by osszesKoltes DESC`;

    try{
        const [results] = await pool.query(sql);
        res.json({results});
    }
    catch (error){
        console.error(error);
        res.status(500).json({hiba: 'Hiba történt az adatbázis lekérdezése közben.'})
    }
});

export default ugyfelrouter;