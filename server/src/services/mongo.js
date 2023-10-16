const mongoose = require('mongoose');
const configEnv = require('../utils/configEnv.utils');
configEnv();
const MONGO_URL = process.env.MONGO_SRC;

mongoose.connection.once('open', () => {
    console.log('MongoDB connection ready !');
});

mongoose.connection.on('error',(err) => {
    console.error(err)
});

async function mongoConnect() {
    // const MONGO_URL = process.env.MONGO_SRC;
    console.log(MONGO_URL)
   await mongoose.connect(MONGO_URL)
}

async function mongoDisconnect() {
    await mongoose.disconnect();
}

module.exports = {
    mongoConnect,
    mongoDisconnect
};