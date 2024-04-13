const fs = require('fs');
const pg = require('pg');
const url = require('url');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const dbConfig = {
    user: config.database.user,
    password: config.database.password,
    host: config.database.host,
    port: config.database.port,
    database: config.database.databaseName,
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync('./ca.pem').toString(),
    },
};

const client = new pg.Client(dbConfig);
client.connect(function (err) {
    if (err) throw err;
    client.query(`
        SELECT to_regclass('public.users') AS table_exists;
    `, [], function (err, result) {
        if (err) throw err;
        const tableExists = result.rows[0].table_exists;
        if (tableExists) {
            console.log('Таблиця "users" вже існує.');
            client.end();
        } else {
            client.query(`
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL
                );
            `, [], function (err, result) {
                if (err) throw err;
                console.log('Таблиця створена успішно!');
                client.end();
            });
        }
    });
});