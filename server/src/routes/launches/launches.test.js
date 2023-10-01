const request = require('supertest');
const app = require('../../app');
const { 
    mongoConnect,
    mongoDisconnect,
} = require('../../services/mongo');

describe('Launches API', () => {
    beforeAll(async () => {
        await mongoConnect();
    });

    afterAll(async() => {
        // await mongoDisconnect();
    })

    describe('Test GET /launches', () => {
        test('It should respond with 200 success', async () => {
            const response = await request(app)
                .get('/launches')
                .expect('Content-Type', /json/)
                .expect(200);
            // expect(response.statusCode).toBe(200);
        })
    });
    
    describe('Test POST /launch', () => {
        const launchObj = {
            mission: 'USS Enterprise',
            rocket: "NCC 1701-D",
            target:"Kepler-442 b",
            launchDate: "January 4, 2028"
        };
    
        const launchObjWithouDate = {
            mission: 'USS Enterprise',
            rocket: "NCC 1701-D",
            target:"Kepler-442 b",
        };
    
        const launchObjWithInvalidDate = {
            mission: 'USS Enterprise',
            rocket: "NCC 1701-D",
            target:"Kepler-442 b",
            launchDate: "root"
        };
    
        test('It should respond with 201 success', async () => {
            const response = await request(app)
                    .post('/launches')
                    .send(launchObj)
                    .expect('Content-Type',/json/)
                    .expect(201);
    
            const requestDate = new Date(launchObj.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
    
            expect(responseDate).toBe(requestDate);
    
            expect(response.body).toMatchObject(launchObjWithouDate)
        });
    
        test('It should catch missing required properties', async () => {
            const response = await request(app)
                .post('/launches')
                .send(launchObjWithouDate)
                .expect('Content-Type',/json/)
                .expect(400);
    
            expect(response.body).toStrictEqual({
                error: `Missing required launch property`
            });
        });
    
        test('It should catch invalid dates', async () => {
            const response = await request(app)
                .post('/launches')
                .send(launchObjWithInvalidDate)
                .expect('Content-Type',/json/)
                .expect(400);
    
            expect(response.body).toStrictEqual({
                error: `Invalid launch date`
            });
        });
    });
});

