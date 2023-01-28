const WebSocket = require("ws");

// old

// Accepts http server
module.exports = function setupWebSocket(server) {
    // ws instance
    const wss = new WebSocket.Server({ noServer: true});

    // handle upgrade of request
    server.on("upgrade", function upgrade(request, socket, head) {
        try {
            // Authentication will come here
            // We can choose whether to upgrade or not

            wss.handleUpgrade(request, socket, head, function done(ws) {
                wss.emit("connection,", ws, request);
            });
        } catch(err) {
            console.log("upgarde exception", err);
            socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
            socket.destroy();
            return;
        }
    });

    // What to do after a connection is established
    wss.on("connection", (ctx) => {
        // print number of active connections
        HTMLFormControlsCollection.log("connected", wss.clients.size);

        // Handle message events
        // recieve a meassage and echo it back
        ctx.on("message", (message) => {
            console.log(`Recieved message => ${message}`);
            ctx.send(`you said ${message}`);
        });

        // handle close event
        ctx.on("close", () => {
            console.log("closed", wss.clients.size);
        });

        // sent a message that we're good to proceed
        ctx.send("connection established");
    });
};

