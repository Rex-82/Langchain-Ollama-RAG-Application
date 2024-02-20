import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let client = null;

// Connect to the MongoDB cluster and return the MongoDB client
// ( If the client is already connected, return the existing client )
export async function connectMongoClient() {
  try {
    if (!client) {
      client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");

      // Connect the client to the server (optional starting in v4.7)
      await client.connect();

      // Send a ping to confirm a successful connection
      await client.db(process.env.MONGODB_DB_NAME).command({ ping: 1 });

      console.log(
        "Pinged your deployment. You successfully connected to MongoDB!",
      );
    }
    return client;
  } catch (e) {
    console.error(e);
    return e;
  }
}

// Close the connection to the MongoDB cluster
export async function disconnectMongoClient() {
  if (client) {
    await client.close();
    client = null;
  }
}
