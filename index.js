const fs = require('fs');
const pg = require('pg');
const url = require('url');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
const schema = fs.readFileSync('schema.sql', 'utf8');


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
    if (err) {
        console.error('Помилка підключення до бази даних:', err);
        return;
    }
    console.log('Підключено до бази даних.');

    client.query(`
        SELECT to_regclass('public.data') AS table_exists;
    `, [], function (err, result) {
        if (err) {
            console.error('Помилка виконання запиту:', err);
            return;
        }
        const tableExists = result.rows[0].table_exists;
        if (tableExists) {
            console.log('Таблиця вже існує.');
            client.end();
        } else {
            client.query(schema, [], function (err, result) {
                if (err) {
                    console.error('Помилка виконання скрипта:', err);
                    return;
                }
                console.log('Таблицю створено успішно!');

                const insertQuery = 'INSERT INTO data (user_name) VALUES ($1), ($2), ($3), ($4), ($5), ($6), ($7), ($8), ($9), ($10), ($11), ($12), ($13), ($14), ($15), ($16), ($17), ($18), ($19), ($20), ($21), ($22), ($23), ($24)';
                const values = data.map(row => row[0]);

                client.query(insertQuery, values, function (err, result) {
                    if (err) {
                        console.error('Помилка внесення даних:', err);
                        return;
                    }
                    console.log('Дані внесено успішно!');
                    client.end();
                });
            });
        }
    });
});