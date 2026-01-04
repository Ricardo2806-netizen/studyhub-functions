const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

app.http('getBoardsByModule', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request) => {

        const module = request.query.get('module');

        if (!module) {
            return {
                status: 400,
                jsonBody: { error: 'Module query parameter is required' }
            };
        }

        const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
        const database = client.database('StudyHubDB');
        const container = database.container('Boards');

        const querySpec = {
            query: 'SELECT * FROM c WHERE c.module = @module',
            parameters: [
                { name: '@module', value: module }
            ]
        };

        const { resources } = await container.items
            .query(querySpec)
            .fetchAll();

        return {
            status: 200,
            jsonBody: resources
        };
    }
});
