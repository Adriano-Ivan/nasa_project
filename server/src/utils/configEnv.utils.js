const dotenv = require('dotenv');
const path = require('path');

function configEnvFile() {
    dotenv.config({
        path: path.join(__dirname, '../../.env')
    });
}

module.exports = configEnvFile;
