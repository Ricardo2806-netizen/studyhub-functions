const axios = require("axios");
const { app } = require("@azure/functions");

app.http("searchBoards", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      const query = request.query.get("q");

      if (!query) {
        return {
          status: 400,
          jsonBody: { error: "Missing query parameter ?q=" }
        };
      }

      const endpoint = process.env.SEARCH_ENDPOINT;
      const apiKey = process.env.SEARCH_API_KEY;

      const url = `${endpoint}/indexes/boards-index/docs/search?api-version=2023-11-01`;

      const response = await axios.post(
        url,
        { search: query },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey
          },
          timeout: 5000
        }
      );

      return {
        status: 200,
        jsonBody: response.data.value
      };
    } catch (err) {
      context.log("ERROR:", err.message);
      return {
        status: 500,
        jsonBody: { error: err.message }
      };
    }
  }
});
