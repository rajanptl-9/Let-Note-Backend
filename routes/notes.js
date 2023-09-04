const { ObjectId } = require('bson');
const express = require('express');
const { getDB } = require('../database');
const fetchUser = require('../middleware/fetchUser');
const router = express.Router();
const Note = require('../models/Notes');

router.get('/fetchallnotes', fetchUser, async (req, res) => {
    let db = getDB();
    let userId = req.user.id;
    let notes = [] ; 
    await db.collection('Notes').find().forEach(ele => {
        // console.log(ele.user,userId);
        if(ele.user.toString() == userId){
            notes.push(ele);
        }
    });
    res.send(notes);
});

router.post('/addnote', fetchUser, async (req, res) => {
        let db = getDB();
        const note = Note({
            title: req.body.title,
            description: req.body.description,
            tag: req.body.tag, 
            user:req.user.id
        })
        db.collection('Notes')
        .insertOne(note)
        .then(() => {
            res.send(note);
        })
        .catch(() => {
            res.status(400).send("Could not add the note.");
        })
});

router.put('/updatenote/:id', fetchUser, async (req, res) => {
    let db = getDB();
    const { title, description, tag } = req.body;
    let o_id = new ObjectId(req.params.id);
    let originalnote = await db.collection('Notes').findOne({"_id" : o_id});
    if(!originalnote){
        return res.status(400).send({error:"Not Found."});
    }    
    if(req.user.id != originalnote.user.toString()){
        return res.status(404).send({error:"You are not allowed to do that."});
    }
    const newnote = {
        title, description, tag
    };
    
    await db.collection('Notes').updateOne({ "_id" : o_id}, {$set: newnote}, {new:true})
    .then(()=>{
        res.status(201).send("Updated the note.");
    })
    .catch((error)=>{
        res.status(500).send(error);
    })    
});

router.delete('/updatenote/:id', fetchUser, async (req, res) => {
    let db = getDB();
    const { title, description, tag } = req.body;
    let o_id = new ObjectId(req.params.id);
    let originalnote = await db.collection('Notes').findOne({"_id" : o_id});
    if(!originalnote){
        return res.status(400).send({error:"Not Found."});
    }
    if(req.user.id != originalnote.user.toString()){
        return res.status(404).send({error:"You are not allowed to do that."});
    }
    await db.collection('Notes').deleteOne({"_id" : o_id}, (err,obj) => {
        if(err) throw err;
        res.status(202).json({"Success": "Note has been deleted."});
    })
    
});


module.exports = router;
