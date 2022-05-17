import { Twilio } from "twilio";
import Configuration from "./configuration";
import { TimeoutMapItem } from "./models";
import { MapItemWrapper } from "./util";

//gets all timeoutitems that are currently in the map (since running daily and deleting should only be for each day)
export const getTimeoutItems = async (
  client: Twilio
): Promise<MapItemWrapper[]> => {
  console.log("Getting Timeout Executions");
  const mapSid = Configuration.twilio.timeoutMapSid;

  const timeoutItems = await client.sync
    .services(Configuration.twilio.syncServiceSid)
    .syncMaps(mapSid)
    .syncMapItems.list({ pageSize: 100 });
  const length = timeoutItems.length;
  const items: MapItemWrapper[] = [];
  for (let i = 0; i < length; i++) {
    console.log(
      `[${i + 1} of ${length}] - Processing Timeout Item ${timeoutItems[i].key}`
    );

    //to get last question reached we can take the flow execution sid which is the key of the item and get the steps
    //if items reason is timeout get last step reached
    const isReasonTimeout = timeoutItems[i].data.reason === "Timeout";
    let lastStepReached = "Error step";
    if (isReasonTimeout) {
      //get last step reached
      const steps = await client.studio.v1
        .flows(timeoutItems[i].data.flowSid)
        .executions(timeoutItems[i].data.flowExecutionSid)
        .steps.list({ limit: 20 });

      //we know last step reached was the last keypress event
      //therefore we can find the audio clip that was last played by going forwards through the steps
      //when we hit a keypress event we take the transitionedFrom event and that is our last step reached/ last audio clip played which should have the most ui friendly name!
      for (let step of steps) {
        if (step.name === "keypress") {
          lastStepReached = step.transitionedFrom;
          break;
        }
      }

      if(lastStepReached === "Error step") {
        console.warn(`\nWARNING - No last step reached found for ${timeoutItems[i].data.flowExecutionSid}`);
      }
    }

    //push a new row for the timeout item
    items.push({
      mapSid,
      mapItemKey: timeoutItems[i].key,
      mapItemData: {
        id: timeoutItems[i].key,
        phoneNumber: timeoutItems[i].data.phoneNumber,
        itemCreatedAt: timeoutItems[i].dateCreated.toISOString(),
        questionReached: lastStepReached,
        reason: timeoutItems[i].data.reason
      }
    });
  }

  return items;
};