import mongoose from "mongoose";

// Define the type for the database connection object
type ConnectionObject = {
    isConnected?: number; // Optional because sometimes it may not be present
};

// Create a connection object
const connection: ConnectionObject = {};

// Function to connect to the database
// async means the function is asynchronous and will return a Promise
// Promise<void> means the promise will not resolve to a value, it will just complete
async function dbConnect(): Promise<void> {
    // If already connected, return
    // This check is to prevent multiple connections
    if (connection.isConnected) {
        console.log("Already connected to the database");
        return;
    }

    // Else, connect to the database
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "");

        // Update the connection object
        connection.isConnected = db.connections[0].readyState;

        console.log("DB Connected Successfully");
    } catch (error) {
        console.error("Database Connection Failed:", error);

        process.exit(1); // Exit the process with failure, process.exit(code) ends the Node.js application immediately.
    }
}

export default dbConnect;
