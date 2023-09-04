
const mongoURI = "mongodb://0.0.0.0:27017/iNotebook";
const { MongoClient } = require('mongodb');
let dbConnection = undefined ;

module.exports = {
    connectToMongo : async (cb) => {
        await MongoClient.connect(mongoURI)
        .then((client)=>{
            dbConnection = client.db();
            return cb();
        })
        .catch(err => {
            return cb(err);
        })
    },
    getDB : () => dbConnection
};