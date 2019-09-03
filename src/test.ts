import * as http from "http";
import { withHttpServer } from ".";

async function main() {
  const httpListener = (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('okay');
  };
  await withHttpServer(httpListener)(async ({ url }) => {
    const response: http.IncomingMessage = await new Promise((resolve) => http.get(url, resolve));
    console.log({ statusCode: response.statusCode });
    /** do something with the response */
  })
  // server is closed at this point.
}

if (require.main === module) {
  (async () => {
    await main();
  })();
}
