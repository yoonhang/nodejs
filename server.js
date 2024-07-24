const express = require('express');
const mysql = require('mysql');
const path = require('path');
const dbconfig = require('./config/dbconfig.json');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: dbconfig.host,
    user: dbconfig.user,
    password: dbconfig.password,
    database: dbconfig.database,
    debug: false
});

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));

app.get('/', (req, res) => {
    console.log('aaa');
    res.sendFile(path.join(__dirname, '/pages/index.html'));
});

app.get('/about', (req, res) => {
    console.log('bbb');
    res.sendFile(path.join(__dirname, '/pages/about.html'));
});

app.get('/working', (req, res) => {
    console.log('ccc');
    res.sendFile(path.join(__dirname, '/pages/working.html'));
});

										   
app.post('/process/login', (req, res) => {
    const paramId = req.body.id;
    const paramPassword = req.body.password;

    pool.getConnection((err, conn) => {
        if (err) {
            if (conn) conn.release();
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf8' });
            res.write('<h2>db conn fail....</h2>');
            res.end();

            return;
        }

        conn.query(
            'SELECT `id`, `name` FROM `users` WHERE `id`=? AND `password`=PASSWORD(?)',
            [paramId, paramPassword],
            (err, rows) => {
                conn.release();
                if (err) {
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf8' });
                    res.write('<h2>sql query error ....</h2>');
                    res.end();
		
                    return;
                }

                if (rows.length > 0) {
                    console.log('[%s] [%s]', paramId, rows[0].name);
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf8' });
                    res.write('<h2>login ok....</h2>');
                    res.end();
		
                } else {
                    console.log('login fail for id: [%s]', paramId);
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf8' });
                    res.write('<h2>login fail, id/pw check........</h2>');
                    res.end();

                }
            }
        );
    });
});
	  

  


app.post('/process/adduser', (req, res) => {
    console.log("/process/adduser 호출됨...." + req);

    const paramId = req.body.id;
    const paramName = req.body.name;
    const paramAge = req.body.age;
    const paramPassword = req.body.password;

    pool.getConnection((err, conn) => {
        if (err) {
            if (conn) conn.release();
            console.log('mysql..............abort');
            return;
        }
        console.log('디비 연결 성공');

        conn.query(
            'INSERT INTO users (id, name, age, password) VALUES (?, ?, ?, PASSWORD(?));',
            [paramId, paramName, paramAge, paramPassword],
            (err, result) => {
                conn.release();

                if (err) {
                    console.log('sql error....');
                    console.dir(err);
                    return;
                }

                if (result) {
                    console.dir(result);
                    console.log('insert success....');

                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf8' });
                    res.write('<h2>add success....</h2>');
                    res.end();
                } else {
                    console.log('write error....');

                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf8' });
                    res.write('<h2>add fail....</h2>');
                    res.end();
                }
            }
        );
    });
});

app.listen(8282, () => {
    console.log('listening port on 8282 .....');
});

