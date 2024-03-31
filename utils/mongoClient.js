import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

/**@type {MongoClient|null}*/ let client = null;

/**
 * Connects to the MongoDB cluster and returns the MongoDB client object
 * ( If the client is already connected, returns the existing client )
 *
 * @async
 * @returns {Promise<MongoClient>} Returns the client object
 * @throws {Error} - Throws an error if cannot connect or ping DB
 */
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
    console.error("Error while connecting to DB:", e);
    throw e;
  }
}

/**
 * Closes the connection to the MongoDB Cluster
 *
 * @async
 * @returns {Promise<void>} 
 */
export async function disconnectMongoClient() {
  if (client) {
    await client.close();
    client = null;
  }
}
