import {Client, TablesDB, Users, Storage, Avatars} from "node-appwrite"

let client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_HOST_URL) // Your API Endpoint
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) // Your project ID
    .setKey(process.env.APPWRITE_API_KEY) // Your secret API key
    
;

const tablesDB = new TablesDB(client)

const users = new Users(client)

const storage = new Storage(client);

const avatars = new Avatars(client);

export { client, tablesDB, users, storage, avatars }
