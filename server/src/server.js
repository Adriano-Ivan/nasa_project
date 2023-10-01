const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const dotenv = require('dotenv');
const path = require('path')
dotenv.config({
    path: path.join(__dirname, '/../.env')
});
const { mongoConnect }= require('./services/mongo');
const { loadPlanetsData } = require('./models/planets.model');



const PORT = process.env.PORT || process.env.NODE_PORT || 8000;


console.log(process.env.PORT,process.env.NODE_PORT, PORT)

async function startServer() {
    // dotenv.config({
    //     path: path.join(__dirname, '/../.env')
    // });

    await mongoConnect();
    await loadPlanetsData();

    server.listen(PORT, function(){
        console.log(`Listening on port ${PORT} `)
    });
}

startServer();


/*
ACID (atomicity, consistency, isolation, durability)

cutU2O7AIgBQ1C4G - senha ATLAS
*/