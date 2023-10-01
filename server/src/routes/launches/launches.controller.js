const { getAllLaunches, existsLaunchWithId, abortLaunchById,scheduleNewLaunch} = require('../../models/launches.model');

async function httpGetAllLaunches(req, res) {
    return res.status(200).json(await getAllLaunches());
}

async function httpAddNewLaunch(req, res) {
    try {
        const launch = req.body;

        if (!launch.mission || !launch.rocket || !launch.launchDate
            || !launch.target) {
                return res.status(400).json({
                    error: `Missing required launch property`
                });
        }

        launch.launchDate = new Date(launch.launchDate);
        if (launch.launchDate.toString() === 'Invalid Date' || isNaN(launch.launchDate)) {
            return res.status(400).json({
                error: `Invalid launch date`
            })
        }
        
        await scheduleNewLaunch(launch);
    
        return res.status(201).json(launch)
    } catch (err) {
        return res.status(500).json({'error': err.message});
    }
}

async function httpAbortLaunch(req, res) {
    const launchId = Number(req.params.id);
    console.log(req.params)
    const launch = await existsLaunchWithId(launchId);
    if(!launch) {
        return res.status(404).json({
            error: "Launch not found"
        });
    }

    const aborted = await abortLaunchById(launchId, launch);

    if (!aborted) {
        return res.status(400).json({
            error: "Launch not aborted"
        });
    }

    return res.status(200).json({
        ok: true
    });
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch
}