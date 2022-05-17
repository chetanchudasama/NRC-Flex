// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

type MyEvent = {
  PhoneNumber?: string;
  FlowExecutionSid?: string;
  FlowSid?: string;
  Reason?: string;
};

type MyContext = {
  SYNC_SERVICE_SID?: string;
  SYNC_TIMEOUT_MAP_SID?: string;
};

/**
 * protected twilio function exposed on the /flow-timeout path.
 * takes a flow execution sid and creates an item on the timeout map with sid for id and last step + reason
 * @param {*} context
 * @param {*} event
 * @param {*} callback
 */

export const handler: ServerlessFunctionSignature = async function (
  context: Context<MyContext>,
  event: MyEvent,
  callback: ServerlessCallback
) {
  //bug check event
  if (
    event.PhoneNumber === undefined ||
    event.FlowExecutionSid === undefined ||
    event.FlowSid === undefined ||
    event.Reason === undefined
  ) {
    console.error("Error, missing fields from event in flow-timeoutfunction");
    return callback("Error, missing fields from event in flow-timeoutfunction");
  }

  //bug check context
  if (context.SYNC_SERVICE_SID === undefined || context.SYNC_TIMEOUT_MAP_SID === undefined) {
    console.error("Error, missing keys from context in flow-timeoutfunction");
    return callback("Error, missing keys from context in flow-timeoutfunction");
  }
  const client = context.getTwilioClient();
  
  //add an item to the map, id is execution sid
  try {
    await client.sync
      .services(context.SYNC_SERVICE_SID)
      .syncMaps(context.SYNC_TIMEOUT_MAP_SID)
      .syncMapItems.create({
        key: event.FlowExecutionSid,
        data: {
          flowSid: event.FlowSid,
          flowExecutionSid: event.FlowExecutionSid,
          phoneNumber: event.PhoneNumber,
          reason: event.Reason,
        },
      });
    callback(null, undefined);
  } catch (e) {
    console.error(e);
    callback(e);
  }
};