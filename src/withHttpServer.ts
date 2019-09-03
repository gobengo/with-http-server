import * as http from "http";

interface IServerInfo {
  server: http.Server;
  url: string;
}

type DoWorkWithServer = (serverInfo: IServerInfo) => Promise<any>;
type AsyncServerContextManager = (
  doWorkWithServer: DoWorkWithServer
) => Promise<any>;

type MaybePromise<T> = T | PromiseLike<T>;

export const withHttpServer = (
  requestListenerOrServer: MaybePromise<http.Server | http.RequestListener>
): AsyncServerContextManager => async (doWorkWithServer: DoWorkWithServer) => {
  const promised = await Promise.resolve(requestListenerOrServer);
  const httpServer: http.Server = (typeof promised === "function") ? http.createServer(promised) : promised;
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
  const ret = await doWorkWithServer({ server: httpServer, url });
  await new Promise((resolve, reject) => {
    httpServer.close(error => (error ? reject(error) : resolve()));
  });
  return ret;
};

export default withHttpServer;
