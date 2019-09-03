# with-http-server

Use a node http.Server and close it when you're done.

Behind the scenes the server will listen on an available port, pass you a URL, and after you're done, automatically close the server.

## Why?

It's pretty useful in tests of http server functionality.

This is what [supertest](https://github.com/visionmedia/supertest) does internally, but this way you're not bound to a nonstandard http request (or assertion) API. You can just use [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) or whatever you want.

## Example

```typescript
import * as http from "http";
import { withHttpServer } from "with-http-server";

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
```
