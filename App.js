//dependencies
const express = require('express');
const cors = require('cors')
const secretInfo = require('./config.js')
const app = express()
const pgp = require('pg-promise')()
const eS = require('express-session')
const expressSession = eS(secretInfo().secret)

//for passport encryption
const bcrypt = require('bcrypt')
const passport = require('passport')
const Strategy = require('passport-local').Strategy
const saltRounds = 10

const passInfo = (req, res, next) => {
    res.db = db
    res.saltRounds = saltRounds
    res.bcrypt = bcrypt
    next()
}

app.use(passInfo)
app.use(expressSession)
app.use(passport.initialize());
app.use(passport.session());
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


//connects to postgres db
const db = pgp(secretInfo().connect)

//logic to create a user 
const createUser = async (req, res, next) => {

    let hash = await bcrypt.hash(req.body.password, saltRounds)
    const searchRegExp = /'/g;
    const replaceWith = "''";
    let insertion = await db.none(`INSERT INTO users (username, email, password, zipcode) VALUES ($1, $2, $3, $4)`,
        [req.body.username, req.body.email, hash, parseInt(req.body.zipcode), false])

    let newUser = await db.one(`SELECT * FROM users where username = '${req.body.username}'`)
    res.send(newUser)
    next()
}

//logic to create a shop
const createShop = async (req, res, next) => {

    let hash = await bcrypt.hash(req.body.password, saltRounds)
    const searchRegExp = /'/g;
    const replaceWith = "''";
    let insertion = await db.none(`INSERT INTO users (username, email, password, zipcode, coffeeshop) VALUES ($1, $2, $3, $4, $5)`,
        [req.body.username, req.body.email, hash, parseInt(req.body.zipcode), true])

    let newShop = await db.one(`SELECT * FROM users where username = '${req.body.username}'`)
    res.send(newShop)
    next()
}

//checks if user aleady exists
const checkIfExist = async (req, res, next) => {
    let result = await db.oneOrNone(`SELECT * FROM users WHERE username='${req.body.username}'`)
    result != null ? res.send(`User Already Exists`) : next()
}


//checks if shop aleady exists
const checkIfShopExist = async (req, res, next) => {
    let result = await db.oneOrNone(`SELECT * FROM users WHERE username='${req.body.username}'`)
    result != null ? res.send(`User Already Exists`) : next()
}

const checkIsLoggedIn = (req, res, next) => {
    let isLoggedIn = req.isAuthenticated()
    if (isLoggedIn) {
        return next()
    }
    res.send({ "loggedin": "false" })
}
//logic to search coffee shop
    const  searchCoffeeShop = async (req, res, next) => {
    let result = await db.any(`SELECT * FROM users WHERE id='${Number(req.body.id)}'`)
    res.send(result)
    next()
}


// seperate pg promise
passport.use(new Strategy((username, password, callback) => {
    db.one(`SELECT * FROM users WHERE username='${username}'`)
        .then(u => {
            console.log(u) //
            bcrypt.compare(password, u.password)
                .then(result => {
                    console.log(result)
                    if (!result) return callback(null, false)
                    return callback(null, u)
                })
        })
        .catch(() => callback(null, false))
}))

passport.serializeUser((user, callback) => callback(null, user.id))

passport.deserializeUser((id, callback) => {
    db.one(`SELECT * FROM users WHERE id='${id}'`)
        .then(u => {
            return callback(null, u)
        })
        .catch(() => callback({ 'not-found': 'No User With That ID Is Found' }))
})

app.get(`/`, checkIsLoggedIn, async (req, res) => {
})

app.post('/login', passport.authenticate('local'), (req, res) => {
    console.log(req.user)
    if (req.user) {
        return res.send({ "loggedin": "true", "user": req.user })
    }
    res.send({ "loggedin": "false" })
})

app.get('/currentUser', checkIsLoggedIn, (req, res) => {
    res.send({ "loggedin": "true", "user": req.user })
})

app.post('/register', checkIfExist, createUser, (req, res) => {

})

app.post('/registershop', checkIfExist, createShop, (req, res) => {

})

app.post('/search', searchCoffeeShop, (req, res) =>{

})
app.get('/coffeeshop/:id', async (req, res) =>{
    console.log(req.params)
    let coffeeshop = await db.one(`SELECT * FROM coffeeshops where id = '${req.params.id}'`)
    res.send(coffeeshop)
})
app.listen(5000)


