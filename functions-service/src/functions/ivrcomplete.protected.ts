// Imports global types
import "@twilio-labs/serverless-runtime-types";

// Imports specific types
import {
  ServerlessCallback,
  Context,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";
import { v4 as uuidv4 } from "uuid";

type MyEvent = {
  From?: string;
  Language?: string;
  Location?: string;
  IsComplaint?: string;
  CallerType?: string;
  HelpOption?: string;
  VoicemailURL?: string;
};

type MyContext = {
  SYNC_SERVICE_SID?: string;
};

/**
 * protected twilio function exposed on the /ivrcomplete path.
 * creates a new callback item for a flow execution
 * @param {*} context
 * @param {*} event
 * @param {*} callback
 */

export const handler: ServerlessFunctionSignature = async (
  context: Context<MyContext>,
  event: MyEvent,
  callback: ServerlessCallback
) => {
  // Create a custom Twilio Response
  // Set the CORS headers to allow Flex to make an HTTP request to the Twilio Function
  const response = new Twilio.Response();
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "OPTIONS, POST, GET");
  response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
  response.appendHeader("Content-Type", "application/json");

  //bug check event
  if (
    event.From === undefined ||
    event.Language === undefined ||
    event.Location === undefined ||
    event.IsComplaint === undefined
  ) {
    response.setBody("Error, missing vital fields from event");
    response.setStatusCode(400);
    callback(null, response);
    return;
  }

  //bug check context
  if (
    context.SYNC_SERVICE_SID === undefined
  ) {
    response.setBody("Error, missing keys from context");
    response.setStatusCode(500);
    callback(null, response);
    return;
  }

  //get number called in (should be E164 formatted)
  const toNumberWithCountry = event.From;

  //parse type
  const isComplaint = event.IsComplaint === "true";


  //get client
  const client = context.getTwilioClient();

  const service = client.sync.services(context.SYNC_SERVICE_SID);
  const mapId = `NRCSudan${event.Language}`;
  const mapItemId = uuidv4();

  let goodResult = true;

  //create a new item that isnt completed
  try {
    await service.syncMaps(mapId).syncMapItems.create({
      key: mapItemId,
      data: {
        initialCallDate: new Date().toISOString(),
        phoneNumber: toNumberWithCountry,
        attempts: 1,
        language: event.Language,
        location: event.Location,
        isComplaint: isComplaint,
        callerType: isComplaint ? "N/A" : event.CallerType,
        helpOption: isComplaint ? "N/A" : event.HelpOption,
        noteUrl: event.VoicemailURL ? event.VoicemailURL : "",
        priority: "Medium",
        completed: false,
        completedBy: "",
        completedAt: "",
        callbackHistory: [],
      },
    });
  } catch (e) {
    console.error(e);
    goodResult = false;
  }

  if (!goodResult) {
    response.setBody("Error on creating callback item");
    response.setStatusCode(500);
    callback(null, response);
    return;
  }

  // everything went as expected, return success
  response.setStatusCode(200);
  callback(null, response);
};
