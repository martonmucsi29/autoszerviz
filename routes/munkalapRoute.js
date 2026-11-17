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
    let sqlmunka = `SELECT m.id, m.rendszam, m.felvetel, m.leiras, m.statusz, m.munkaora FROM munkalapok m JOIN ugyfelek u ON u.id = m.ugyfel_id JOIN felhasznalasok f ON f.munkalap_id = m.id JOIN alkatreszek a ON a.id = f.alkatresz_id WHERE m.id = ? GROUP BY m.id`;
    let sqlugyfel = `SELECT u.id, u.nev, u.telefon, m.munkaora FROM munkalapok m JOIN ugyfelek u ON u.id = m.ugyfel_id JOIN felhasznalasok f ON f.munkalap_id = m.id JOIN alkatreszek a ON a.id = f.alkatresz_id WHERE m.id = ? GROUP BY m.id`;
    let sqlalkatresz = `SELECT a.id, a.nev, a.nev, f.db, a.ar, (a.ar * f.db) AS osszeg FROM munkalapok m JOIN ugyfelek u ON u.id = m.ugyfel_id JOIN felhasznalasok f ON f.munkalap_id = m.id JOIN alkatreszek a ON a.id = f.alkatresz_id WHERE m.id = ? GROUP BY a.nev ORDER BY a.nev ASC`;
    let sqlvegosszeg = `SELECT ROUND((m.munkaora * 12000), 0) AS munkaDij, SUM(a.ar * f.db) AS alkatreszDij, ROUND((m.munkaora * 12000) + SUM(a.ar * f.db), 0) AS vegosszeg FROM munkalapok m JOIN ugyfelek u ON u.id = m.ugyfel_id JOIN felhasznalasok f ON f.munkalap_id = m.id JOIN alkatreszek a ON a.id = f.alkatresz_id WHERE m.id = ? GROUP BY m.id`;

    try{
        const [munkalap] = await pool.query(sqlmunka, [id]);
        const [ugyfel] = await pool.query(sqlugyfel, [id]);
        const [alkatresz] = await pool.query(sqlalkatresz, [id]);
        const [vegosszeg] = await pool.query(sqlvegosszeg, [id]);
        if (munkalap.length === 0) {
            return res.status(400).json({
                "alkatrészek": alkatresz,
                "vegosszeg": 0
            });
        }
        res.json({
            id: munkalap[0].id,
            rendszam: munkalap[0].rendszam,
            felvetel: munkalap[0].felvetel,
            leiras: munkalap[0].leiras,
            statusz: munkalap[0].statusz,

            ugyfel: {
                id: ugyfel[0].id,
                nev: ugyfel[0].nev,
                telefon: ugyfel[0].telefon
            },

            munkaora: ugyfel[0].munkaora,

            alkatreszek: alkatresz,

            munkadij: vegosszeg[0].munkaDij,
            alkatreszDij: vegosszeg[0].alkatreszDij,
            vegosszeg: vegosszeg[0].vegosszeg
        });
    }
    catch (error){
        console.error(error);
        res.status(500).json({hiba: 'Hiba történt az adatbázis lekérdezése közben.'})
    }
});

munkarouter.patch('/:id/statusz', async (req, res) => {
    const { id } = req.params;
    const { statusz } = req.body;
    
    let sql = `UPDATE munkalapok SET statusz = ? WHERE id = ?`;
    let eredmeny = await pool.query(sql, [statusz, id]);

    res.status(201).json(eredmeny);
});

export default munkarouter;