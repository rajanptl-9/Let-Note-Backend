const express = require('express');
const User = require('../models/User')
const { getDB } = require('../database');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "#the@userisnowverified#";
const fetchuser = require('../middleware/fetchUser');
const { ObjectId } = require('bson');

router.post('/createuser', async (req, res) => {
    let db = getDB();
    if (db == undefined) {
        return res.status(500).json({ "err": "Could not connect with data." });
    }
    let userexist = await db.collection('User').findOne({ email: req.body.email });
    // console.log(userexist);
    if (userexist) {
        return res.status(400).json({ msg: "User is already exist with the same email." });
    }
    const salt = bcrypt.genSaltSync(10);
    const secPassword = bcrypt.hashSync(req.body.password, salt);
    const userdata = User({
        name: req.body.name,
        password: secPassword,
        email: req.body.email
    });
    const data = {
        user: {
            id: userdata._id.toString()
        }
    }
    db.collection('User')
        .insertOne(userdata)
        .then(() => {
            const authToken = jwt.sign(data, JWT_SECRET);
            return res.json({ success: true, authToken });
        })
        .catch(err => {
            return res.status(500).json({ err: "Could not create a new document" })
        })
});

router.post('/login', async (req, res) => {
    let db = getDB();
    const { email, password } = req.body;
    try {
        let userdata = await db.collection('User')
            .findOne({ email })
        if (userdata === null) {
            return res.status(400).json({ error: "Invalid Email or Password." });
        }
        const passwordComp = bcrypt.compareSync(password, userdata.password);
        if (!passwordComp) {
            return res.status(400).json({ error: "Invalid Email or Password." });
        }
        const data = {
            user: {
                id: userdata._id.toString()
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        return res.send({ success: true, authToken });
    } catch (error) {
        return res.status(500).send("Ineternal server error.");
    }
})

router.post('/getuser', fetchuser, async (req, res) => {
    try {
        let db = getDB();
        let o_id = new ObjectId(req.user.id);
        let userdata = await db.collection('User').findOne({ "_id": o_id });
        delete userdata.password;
        res.json(userdata);
    } catch (error) {
        return res.status(500).send("Ineternal server error.");
    }
});


module.exports = router;