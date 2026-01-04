const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

app.http("updateBoard", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "boards/{id}",
  handler: async (request, context) => {
    const id = request.params.id;
    const body = await request.json();

    if (!body.module) {
      return {
        status: 400,
        jsonBody: { error: "Module is required (partition key)" }
      };
    }

    const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
    const container = client
      .database("StudyHubDB")
      .container("Boards");

    // 🔑 Read existing document first
    const { resource: existingBoard } =
      await container.item(id, body.module).read();

    if (!existingBoard) {
      return { status: 404, jsonBody: { error: "Board not found" } };
    }

    // 🔄 Merge update (preserve fileUrl)
    const updatedBoard = {
      ...existingBoard,
      title: body.title ?? existingBoard.title,
      description: body.description ?? existingBoard.description
    };

    await container
      .item(id, body.module)
      .replace(updatedBoard);

    return {
      status: 200,
      jsonBody: updatedBoard
    };
  }
});
