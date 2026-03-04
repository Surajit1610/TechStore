import { Client, Account, Avatars } from "appwrite";

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_HOST_URL) // Your API Endpoint
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID); // Your project ID


const account = new Account(client);

const avatars = new Avatars(client);

export { client, account, avatars }