import { Client, Account, TablesDB } from "node-appwrite";

export async function authenticateServer(request: Request) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
       return null;
    }

    const jwt = authHeader.split(" ")[1];

    try {
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_HOST_URL!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
            .setJWT(jwt);

        const account = new Account(client);
        const dbClient = new TablesDB(client);

        const user = await account.get();
        return { user, dbClient };
    } catch {
        return null;
    }
}
