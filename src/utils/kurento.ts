import kurento from "kurento-client";

let kurentoClient: any = null;
const wsUri = "ws://localhost:8888/kurento";

export const getKurentoClient = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (kurentoClient !== null) {
      return resolve(kurentoClient);
    }
    kurento(wsUri).then(
      (client) => {
        kurentoClient = client;
        resolve(kurentoClient);
      },
      (error) => {
        reject(`Could not find media server at address ${wsUri}: ${error}`);
      }
    );
  });
};
