const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');
const DEFAULT_FLIGHT_NUMBER = 100;
const launches = new Map();

const launch = {
    flightNumber: 100,
    mission: "Kepler Exploration X",
    rocket: "Explorer IS1",
    launchDate: new Date('December 27, 2030'),
    target: "Kepler-442 b",
    customers: ['ZTM','NASA'],
    upcoming: true,
    success: true,
};

saveLaunch(launch);

// launches.set(launch.flightNumber, launch);

async function existsLaunchWithId(launchId) {
    return await launchesDatabase.findOne({
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

async function getAllLaunches(){
    return await launchesDatabase
                    .find({}, {
                        "_id": 0,
                        "__v": 0,
                    });
}

async function saveLaunch (launch) {
    const planet = await planets.findOne({
        keplerName: launch.target
    });

    if(!planet){
        throw new Error('No matching planet was found');
    }

    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true
    });
}

async function scheduleNewLaunch(launch) {
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

module.exports = {
    existsLaunchWithId,
    getAllLaunches,
    saveLaunch,
    scheduleNewLaunch,
    abortLaunchById
}