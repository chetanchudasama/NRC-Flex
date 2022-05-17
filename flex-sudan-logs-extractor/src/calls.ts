import { Twilio } from "twilio";
import { CallLeg } from "./models";

export const getCallLogs = async (client: Twilio, fromDate: Date, untilDate: Date): Promise<CallLeg[]> => {

    console.log(`Getting Calls made from: ${fromDate.toISOString()} to ${untilDate.toISOString()}`);
    const calls = await client.calls.list({
        startTimeAfter: fromDate,
        endTimeBefore: untilDate,
        pageSize: 100
    });

    const items: CallLeg[] = [];
    console.log(`${calls.length} Calls to process ...`);

    for (var i = 0, l = calls.length; i < l; i++) {
        console.log(`[${i + 1} of ${l}] - Processing Call ${calls[i].sid}`);

        switch (calls[i].status) {
            case "in-progress":
            case "ringing":
            case "queued":
                console.log(`Skipping as call ${calls[i].status} is not in a done state`);
                continue;
        }

        items.push({
            callSid: calls[i].sid,
            createdAt: calls[i].dateCreated.toISOString(),
            startedAt: calls[i].startTime.toISOString(),
            completedAt: calls[i].endTime.toISOString(),
            to: calls[i].to,
            isAgentLeg: calls[i].to.startsWith("client:"),
            duration: calls[i].duration,
            status: calls[i].status,
            price: calls[i].price,
            priceUnit: calls[i].priceUnit
        });
    }

    return items;
};
