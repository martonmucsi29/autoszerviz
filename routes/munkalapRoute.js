import pool from '../utils/db.js';
import { Router } from 'express';

const munkarouter = Router();

munkarouter.get('/', async (req, res) => {
    let params = [];
    let szurok = [];

    const {statusz, rendszam} = req.query;

    let sql = `SELECT m.id, m.rendszam, u.nev, m.felvetel, m.leiras, m.statusz, m.munkaora, ROUND((m.munkaora * 12000), 0) AS munkaDij, SUM(a.ar * f.db) AS alkatreszDij, ROUND((m.munkaora * 12000) + SUM(a.ar * f.db), 0) AS vegosszeg FROM munkalapok m JOIN ugyfelek u ON u.id = m.ugyfel_id JOIN felhasznalasok f ON f.munkalap_id = m.id JOIN alkatreszek a ON a.id = f.alkatresz_id`;

    if(statusz){
        params.push(statusz);
        szurok.push(`m.statusz = ?`);
    }

    if(rendszam){
        params.push(rendszam);
        szurok.push(`m.rendszam = ?`);
    }

    if(szurok.length > 0) {
        sql += ` WHERE ${szurok.join(' AND ')}`;
    }

    sql += ` GROUP BY m.id ORDER BY m.felvetel`;

    try{
        const [results] = await pool.query(sql, params);
        if (results.length === 0) {
            return res.status(400).json({hiba: "Nincs a megadott paramétereknek megfelelő jármű az adatbázisban"});
        }
        res.json({results});
    }
    catch (error){
        console.error(error);
        res.status(500).json({hiba: 'Hiba történt az adatbázis lekérdezése közben.'})
    }
});

munkarouter.get('/:id', async (req, res) => {
    const {id} = req.params;
    let sql = `SELECT m.id, m.rendszam, m.felvetel, m.leiras, m.statusz, m.munkaora, u.nev FROM munkalapok m JOIN ugyfelek u ON u.id = m.ugyfel_id JOIN felhasznalasok f ON f.munkalap_id = m.id JOIN alkatreszek a ON a.id = f.alkatresz_id WHERE m.id = ? GROUP BY m.id`;
    let sqlugyfel = `SELECT u.id, u.nev, u.telefon FROM munkalapok m JOIN ugyfelek u ON u.id = m.ugyfel_id JOIN felhasznalasok f ON f.munkalap_id = m.id JOIN alkatreszek a ON a.id = f.alkatresz_id WHERE m.id = ? GROUP BY m.id`;

    try{
        const [results] = await pool.query(sql, [id]);
        const [resultsugyfel] = await pool.query(sqlugyfel, [id]);
        res.json({
            "munkalap": results,
            "ugyfel": resultsugyfel
        });
    }
    catch (error){
        console.error(error);
        res.status(500).json({hiba: 'Hiba történt az adatbázis lekérdezése közben.'})
    }
});

export default munkarouter;