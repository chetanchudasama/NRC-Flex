import { Twilio } from "twilio";
import { Worker } from "./models";

export const getWorkers = async (client: Twilio, workspaceSid: string): Promise<Worker[]> => {
    console.log(`Getting Workers from Workspace: ${workspaceSid}`);
    const workers = await client.taskrouter.workspaces(workspaceSid).workers.list();
    console.log(`Processing ${workers.length} Workers`);
    return workers.map<Worker>(e => {
        const attributes = JSON.parse(e.attributes) || {};
        return {
            workerSid: e.sid,
            name: e.friendlyName,
            email: attributes.email || "",
            contactUri: attributes.contact_uri || ""
        };
    });
};
