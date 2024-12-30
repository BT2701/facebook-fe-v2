import * as signalR from "@microsoft/signalr";

// Create connection with current userId
const connection = (userId) =>
  new signalR.HubConnectionBuilder()
    .withUrl(`http://localhost:8002/chathub?userId=${userId}`)
    .withAutomaticReconnect()
    .build();

// Start connection
const startConnection = async (userId) => {
  try {
    const conn = connection(userId);
    await conn.start();
    console.log("Connect chat service successfully!");
    return conn;
  } catch (err) {
    console.error("Cannot connect chat service:", err);
    setTimeout(() => startConnection(userId), 5000);
    return null;
  }
};

// Export startConnection
export default startConnection;
