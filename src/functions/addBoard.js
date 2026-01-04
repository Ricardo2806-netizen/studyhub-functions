const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

app.http('addBoard', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request) => {

        const body = await request.json();

        const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
        const database = client.database('StudyHubDB');
        const container = database.container('Boards');

        const newBoard = {
            id: Date.now().toString(),
            title: body.title,
            description: body.description,
            module: body.module
        };

        await container.items.create(newBoard);

        return {
            status: 201,
            jsonBody: newBoard
        };
    }
});
