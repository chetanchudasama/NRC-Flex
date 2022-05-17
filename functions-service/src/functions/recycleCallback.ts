// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

import Client from "twilio/lib/rest/Twilio";

type MyEvent = {
  MapId?: string;
  MapItemId?: string;
};

type MyContext = {
  SYNC_SERVICE_SID?: string;
};

/**
 * public twilio function exposed on the /completecallback path.
 * marks the mapItem as complete
 * @param {*} context
 * @param {*} event
 * @param {*} callback
 */

const TokenValidator = require("twilio-flex-token-validator").functionValidator;
export const handler: ServerlessFunctionSignature = TokenValidator(
  async function (
    context: Context<MyContext>,
    event: MyEvent,
    callback: ServerlessCallback
  ) {
    // Create a custom Twilio Response
    // Set the CORS headers to allow Flex to make an HTTP request to the Twilio Function
    const response = new Twilio.Response();
    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "OPTIONS, POST, GET");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
    response.appendHeader("Content-Type", "application/json");

    //bug check event
    if (event.MapId === undefined || event.MapItemId === undefined) {
      response.setBody("Missing fields in event for recycle callback");
      response.setStatusCode(400);
      callback(null, response);
      return;
    }

    //bug check context
    if (context.SYNC_SERVICE_SID === undefined) {
      response.setBody("Missing fields in context for recycle callback");
      response.setStatusCode(500);
      callback(null, response);
      return;
    }

    //get client
    const client = context.getTwilioClient();

    //call function
    const goodResult = await fetchAndRemoveMapItem(
      client,
      context.SYNC_SERVICE_SID,
      event.MapId,
      event.MapItemId
    );

    if (goodResult) {
      response.setStatusCode(200);
      callback(null, response);
    } else {
      response.setStatusCode(500);
      response.setBody("Failed to recycle callback");
      callback(null, response);
    }
  }
);

async function fetchAndRemoveMapItem(
  client: Client,
  serviceId: string,
  mapId: string,
  mapItemId: string
) {
  const service = client.sync.services(serviceId);

  let attempts = 1;
  let success = false;
  while (success === false && attempts <= 3) {
    //try updating and deleting
    try {
      //fetch item
      const mapItem = await service
        .syncMaps(mapId)
        .syncMapItems(mapItemId)
        .fetch();

      //modify fields locally
      mapItem.data.completed = false;
      mapItem.data.completedBy = "";
      mapItem.data.completedAt = "";

      //call update with new data
      await mapItem.update({
        data: mapItem.data,
        ifMatch: mapItem.revision,
      });

      success = true;
    } catch (e) {
      console.error(e);
      attempts++;
    }
  }

  if (success) {
    return true;
  } else {
    return false;
  }
}
