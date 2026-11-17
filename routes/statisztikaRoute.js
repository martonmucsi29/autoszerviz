import pool from '../utils/db.js';
import { Router } from 'express';

const statrouter = Router();

statrouter.get('/statuszok', async (req, res) => {
    let sql = `SELECT m.statusz, COUNT(DISTINCT m.id) AS db FROM munkalapok m LEFT JOIN ugyfelek u ON u.id = m.ugyfel_id LEFT JOIN felhasznalasok f ON f.munkalap_id = m.id LEFT JOIN alkatreszek a ON a.id = f.alkatresz_id GROUP BY m.statusz ORDER BY m.statusz`;
    
    try{
        const [results] = await pool.query(sql);
        res.json({results});
    }
    catch (error){
        console.error(error);
        res.status(500).json({hiba: 'Hiba történt az adatbázis lekérdezése közben.'})
    }
});

statrouter.get('/alkatreszek', async (req, res) => {
    let sql = `SELECT a.nev, COUNT(f.db) AS felhasznaltDb, SUM(a.ar * f.db) AS bevetel FROM munkalapok m LEFT JOIN ugyfelek u ON u.id = m.ugyfel_id LEFT JOIN felhasznalasok f ON f.munkalap_id = m.id JOIN alkatreszek a ON a.id = f.alkatresz_id GROUP BY a.nev ORDER BY bevetel DESC`;

    try{
        const [results] = await pool.query(sql);
        res.json({results});
    }
    catch (error){
        console.error(error);
        res.status(500).json({hiba: 'Hiba történt az adatbázis lekérdezése közben.'})
    }
});

export default statrouter;