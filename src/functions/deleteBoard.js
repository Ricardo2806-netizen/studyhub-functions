const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

app.http('deleteBoard', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'boards/{id}',

    handler: async (request, context) => {

        const id = request.params.id;
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

        await container.item(id, module).delete();

        return {
            status: 200,
            jsonBody: { message: 'Board deleted successfully' }
        };
    }
});
