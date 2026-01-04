const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');
const { CosmosClient } = require('@azure/cosmos');

app.http('uploadBoardFile', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'boards/{id}/upload',
    handler: async (request, context) => {

        context.log('UPLOAD STARTED');

        const boardId = request.params.id;
        context.log('Board ID:', boardId);

        const buffer = await request.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);
        context.log('File read into buffer');

        // Blob Storage
        const blobServiceClient = BlobServiceClient.fromConnectionString(
            process.env.BLOB_CONNECTION_STRING
        );
        context.log('Blob client created');

        const containerClient = blobServiceClient.getContainerClient('boards');
        context.log('Container client obtained');

        const blobName = `${boardId}-${Date.now()}.bin`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        context.log('Blob client created:', blobName);

        await blockBlobClient.uploadData(fileBuffer);
        context.log('Blob uploaded');

        const fileUrl = blockBlobClient.url;

        // Cosmos DB
        const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
        context.log('Cosmos client created');

        const database = cosmosClient.database('StudyHubDB');
        const container = database.container('Boards');

        const query = {
            query: 'SELECT * FROM c WHERE c.id = @id',
            parameters: [{ name: '@id', value: boardId }]
        };

        context.log('Querying Cosmos DB');
        const { resources } = await container.items.query(query).fetchAll();
        context.log('Cosmos query returned');

        if (resources.length === 0) {
            context.log('Board not found');
            return { status: 404, jsonBody: { message: 'Board not found' } };
        }

        const board = resources[0];
        board.fileUrl = fileUrl;

        await container.items.upsert(board);
        context.log('Cosmos DB updated');

        return {
            status: 200,
            jsonBody: {
                message: 'File uploaded successfully',
                fileUrl
            }
        };
    }


});
