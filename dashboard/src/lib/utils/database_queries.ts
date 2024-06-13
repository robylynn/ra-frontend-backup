// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { MongoClient } from "mongodb";

import {
  DatabaseDocument,
  DatabaseDocumentArray,
  DatabaseDocumentInterface,
  DatabaseFrontendMessage,
  DatabaseFrontendMessageInterface,
  DatabaseIOState,
  DatabaseIOStateArray,
  DatabaseIOStateInterface,
  DatabaseMessageArray,
} from "@/lib/reusable_models/database_models";

let mongo_client: MongoClient;
let client_connected: boolean = false;

async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Please add your Mongo URI to .env.local");
  }

  const uri = process.env.MONGODB_URI;
  const options = {
    connectTimeoutMS: 1000,
    serverSelectionTimeoutMS: 5000,
    monitorCommands: true,
  };

  if (!mongo_client || !client_connected) {
    if (process.env.NODE_ENV === "development") {
      mongo_client = new MongoClient(uri, options);
      await mongo_client.connect();
    } else {
      mongo_client = new MongoClient(uri, options);
      await mongo_client.connect();
    }
  }
}

async function closeDatabaseConnection() {
  await mongo_client.close();
  client_connected = false;
}

export async function getDatabaseDocuments(
  count?: number,
): Promise<Array<DatabaseDocument> | null> {
  try {
    await connectToDatabase();
    const db = mongo_client.db(process.env.DATABASE_NAME);

    const select_result: Array<DatabaseDocumentInterface> = (await db
      .collection(process.env.DATA_COLLECTION as string)
      .find()
      .sort({ timestamp: -1 })
      .limit(count ?? 1)
      .toArray()
      .then((arr) => arr)) as Array<DatabaseDocumentInterface>;

    const document_array = new DatabaseDocumentArray(select_result);

    client_connected = true;
    return document_array.documents;
  } catch (e) {
    console.error("Database error getting data documents: " + e);
    closeDatabaseConnection();
    return null;
  }
}

export async function getDatabaseMessages(
  count?: number,
): Promise<Array<DatabaseFrontendMessage> | null> {
  try {
    await connectToDatabase();
    const db = mongo_client.db(process.env.DATABASE_NAME);

    const select_result: Array<DatabaseFrontendMessageInterface> = (await db
      .collection(process.env.MESSAGES_COLLECTION as string)
      .find()
      .sort({ timestamp: -1 })
      .limit(count ?? 1)
      .toArray()
      .then((arr) => arr)) as Array<DatabaseFrontendMessageInterface>;

    const document_array = new DatabaseMessageArray(select_result);

    client_connected = true;
    return document_array.documents;
  } catch (e) {
    console.log("Database error getting messages: " + e);
    closeDatabaseConnection();
    return null;
  }
}

export async function getDatabaseIOState(
  count?: number,
): Promise<Array<DatabaseIOState> | null> {
  try {
    await connectToDatabase();
    const db = mongo_client.db(process.env.DATABASE_NAME);

    const select_result: Array<DatabaseIOStateInterface> = (await db
      .collection(process.env.IO_STATE_COLLECTION as string)
      .find()
      .sort({ timestamp: -1 })
      .limit(count ?? 1)
      .toArray()
      .then((arr) => arr)) as Array<DatabaseIOStateInterface>;

    const document_array = new DatabaseIOStateArray(select_result);

    client_connected = true;
    return document_array.documents;
  } catch (e) {
    console.log("Database error getting IO state: " + e);
    closeDatabaseConnection();
    return null;
  }
}
