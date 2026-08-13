import * as signalR from '@microsoft/signalr';

let connection: signalR.HubConnection | null = null;
let startPromise: Promise<void> | null = null;

function buildConnection(): signalR.HubConnection {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/hubs/fleet-tracking`, {
      accessTokenFactory: () => localStorage.getItem('token') ?? '',
    })
    .withAutomaticReconnect()
    .build();
}

export function getFleetConnection(): signalR.HubConnection {
  if (!connection) {
    connection = buildConnection();
  }
  return connection;
}

export function startFleetConnection(): Promise<void> {
  const conn = getFleetConnection();

  if (conn.state === signalR.HubConnectionState.Connected) {
    return Promise.resolve();
  }

  if (!startPromise) {
    startPromise = conn.start().catch((err) => {
      startPromise = null; // allow retry on next call if this attempt failed
      throw err;
    });
  }

  return startPromise;
}