const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

app.http('getBoards', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async () => {

        const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
        const database = client.database('StudyHubDB');
        const container = database.container('Boards');

        const { resources } = await container.items
            .query('SELECT * FROM c')
            .fetchAll();

        return {
            status: 200,
            jsonBody: resources
        };
    }
});
