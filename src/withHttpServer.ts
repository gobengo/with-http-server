import * as http from "http";

interface IServerInfo {
  url: string;
}

type DoWorkWithServer = (serverInfo: IServerInfo) => Promise<any>;
type AsyncServerContextManager = (
  doWorkWithServer: DoWorkWithServer
) => Promise<any>;

export const withHttpServer = (
  requestListener: Promise<http.RequestListener> | http.RequestListener
): AsyncServerContextManager => async (doWorkWithServer: DoWorkWithServer) => {
  const httpServer = http.createServer(await requestListener);
  await new Promise((resolve, reject) => {
    httpServer.listen(0, "127.0.0.1", resolve);
  });
  const addressInfo = httpServer.address();
  if (!addressInfo || typeof addressInfo === "string") {
    throw new Error(
      `Expected addressInfo to be object, but got ${addressInfo}`
    );
  }
  const { address, port } = addressInfo;
  const url = `http://${address}:${port}`;
  const ret = await doWorkWithServer({ url });
  await new Promise((resolve, reject) => {
    httpServer.close(error => (error ? reject(error) : resolve()));
  });
  return ret;
};

export default withHttpServer;
