const axios = require('axios');
const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');
const DEFAULT_FLIGHT_NUMBER = 100;

/*
const launch = {
    flightNumber: 100, // flight_number
    mission: "Kepler Exploration X", // name
    rocket: "Explorer IS1", // rocket.name
    launchDate: new Date('December 27, 2030'), // date_local
    target: "Kepler-442 b", // not applicable
    customers: ['ZTM','NASA'], // payload.customers for each payload
    upcoming: true, // upcoming
    success: true,  // success
};
*/

// saveLaunch(launch)

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
    console.log('Load launches data...')
    const response = await axios.post(SPACEX_API_URL, {
        query: { },
        options: {
            pagination: false,
            populate: [
                {
                    path: "rocket",
                    select: {
                        name: 1
                    }
                }, 
                {
                    path: "payloads",
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    });

    if(response.status !== 200) {
        console.log('Problem downloading launch data');
        throw new Error('Launch data download failed');
    }

    const launchDocs = response.data.docs;

    for(const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => payload.customers);
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers
        }

        
        console.log(`${launch.flightNumber} ${launch.mission}`);

        await saveLaunch(launch);
    }
}

async function findLaunch(filter) {
    console.log('launch find launch',filter)
    return await launchesDatabase.findOne(filter);
}

async function loadLaunchesData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: "Falcon 1",
        mission: "FalconSat"
    });

    if(firstLaunch) {
        console.log('Launch data already loaded!!');
    } else {
        await populateLaunches();
    }
}

async function existsLaunchWithId(launchId) {
    return await findLaunch({
        flightNumber: launchId
    });;
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase 
        .findOne()
        .sort('-flightNumber');

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit){
    return await launchesDatabase
                    .find({}, {
                        "_id": 0,
                        "__v": 0,
                    })
                    .sort({ flightNumber: 1 })
                    .skip(skip)
                    .limit(limit);
}

async function saveLaunch (launch) {

    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true
    });
}

async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target
    });

    if(!planet){
        throw new Error('No matching planet was found');
    }

    const newFlightNumber = await getLatestFlightNumber() + 1;

    const newLaunch = Object.assign(launch, {
        flightNumber: newFlightNumber,
        success: true,
        upcoming: true,
        customers: ['Adriano','NASA']
    });

    await saveLaunch(newLaunch);
}

// function addNewLaunch(launch) {
//     latestFlightNumber++;
//     launches.set(
//         latestFlightNumber, 
//         Object.assign(launch, {
//             customers: ['Adriano','NASA'],
//             upcoming: true,
//             success: true,
//             flightNumber: latestFlightNumber
//         })
//     );
    
// }

async function abortLaunchById(launchId) {
    const launchNumber = Number(launchId);

    const abortedLaunch = await launchesDatabase.updateOne({
        flightNumber: launchNumber,
    }, {
        upcoming: false,
        success: false
    });

    return abortedLaunch.modifiedCount === 1;
}

async function iniateDefaultOperations() {
    // await saveLaunch(launch);
    await loadLaunchesData();
}

module.exports = {
    existsLaunchWithId,
    getAllLaunches,
    saveLaunch,
    scheduleNewLaunch,
    abortLaunchById,
    iniateDefaultOperations
}