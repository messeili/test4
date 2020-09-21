'use strict'
//app dependencies
const dotenv = require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');
const methodOverride = require('method-override');

const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
const PORT = process.env.PORT;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

//Routes

app.get('/', mainPageHandler);
app.post('/addJoke', addJokeHandler);
app.get('/favJokes', favJokesHandler);
app.get('/Joke/:id', JokeDetailsHandler);
app.delete('/deleteJoke/:id', deleteJokeHandler);
app.put('/updateJoke/:id', updateJokeHandler);
app.get('/ranJokes', ranJokesHandler);



//functions
function mainPageHandler(req, res) {
    let url = `https://official-joke-api.appspot.com/jokes/programming/ten`
    superagent.get(url).then((results) => {
        res.render('pages/index', { data: results.body })
    })
}

function addJokeHandler(req, res) {
    let { jokeid, type, setup, punchline } = req.body;
    console.log(req.body);
    let SQL = `INSERT INTO test4 (jokeid,type,setup,punchline) VALUES ($1,$2,$3,$4);`
    let VALUES = [jokeid, type, setup, punchline]
    client.query(SQL, VALUES).then(() => {
        res.redirect('/favJokes')
    })
}

function favJokesHandler(req, res) {
    let SQL = `SELECT * FROM test4;`;
    client.query(SQL).then((results) => {
        if (results.rows.length != 0) {
            res.render('pages/favJokes', { data: results.rows })
        } else {
            res.render('pages/error', { data: "There is No Fav Jokes" })
        }
    })
}

function JokeDetailsHandler(req, res) {
    let idParams = req.params.id;
    let SQL = `SELECT * FROM test4 WHERE id=$1;`;
    let VALUES = [idParams];
    client.query(SQL, VALUES).then((results) => {
        res.render('pages/jokeDetails', { data: results.rows[0] })
    })
}

function deleteJokeHandler(req, res) {
    let idParams = req.params.id;
    let SQL = `DELETE FROM test4 WHERE id=$1;`;
    let VALUES = [idParams];
    client.query(SQL, VALUES).then(() => {
        res.redirect('/favJokes')
    })
}

function updateJokeHandler(req, res) {
    let { jokeid, type, setup, punchline } = req.body;
    let idParams = req.params.id;
    let SQL = `UPDATE test4 SET jokeid=$1,type=$2,setup=$3,punchline=$4 WHERE id=$5;`;
    let VALUES = [jokeid, type, setup, punchline, idParams];
    client.query(SQL, VALUES).then(() => {
        res.redirect(`/joke/${idParams}`)
    })
}

function ranJokesHandler(req, res) {
    let url = `https://official-joke-api.appspot.com/jokes/programming/random`
    superagent.get(url).then((results) => {
        res.render('pages/ranJokes', { data: results.body })
    })
}





//Port listening

client.connect().then(() => {
    app.listen(PORT, () => {
        console.log(`Listening to PORT:${PORT}`);
    })
})
