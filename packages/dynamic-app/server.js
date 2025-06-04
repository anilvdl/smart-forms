const { createServer } = require("http");
const next            = require("next");

const dev  = process.env.NODE_ENV !== "production";
const host = "0.0.0.0";

// LiteSpeed hands you a UNIX‐socket path here; locally it’s undefined.
const LS_SOCKET = process.env.LSNODE_SOCKET;

// Fallback TCP port for local dev or any other host.
const PORT = process.env.PORT || 3001;

const app    = next({ dev, hostname: host, port: PORT, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res));

  if (LS_SOCKET) {
    // Production on Namecheap: bind to the socket LSAPI provided
    server.listen(LS_SOCKET, () => {
      console.log(`Listening on LSAPI socket: ${LS_SOCKET}`);
    });
  } else {
    // Local development: bind to localhost:PORT
    server.listen(PORT, host, (err) => {
      if (err) throw err;
      console.log(`Dev server running at http://${host}:${PORT}`);
    });
  }
});