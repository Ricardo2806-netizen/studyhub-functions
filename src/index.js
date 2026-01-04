const { app } = require('@azure/functions');

app.setup({
    enableHttpStream: true,
});

// Import each function so the app registers their HTTP handlers
require('./functions/addBoard');
require('./functions/getBoards');
require('./functions/deleteBoard');
require('./functions/updateBoard');
require('./functions/getBoardsByModule');
require('./functions/uploadBoardFile');
require("./functions/searchBoards");



