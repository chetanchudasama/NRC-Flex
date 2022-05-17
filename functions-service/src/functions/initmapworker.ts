// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

type MyEvent = {
  TokenResult?: any;
};

type MyContext = {
  SYNC_SERVICE_SID?: string;
};

/**
 * public twilio function exposed on the /updatemapworker path.
 * protected via flex token, (admin/supervisors only).
 * adds/removes worker from given sync map and updates relevant sync document.
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
    if (event.TokenResult === undefined) {
      response.setBody("Error, missing token result from event");
      response.setStatusCode(400);
      callback(null, response);
      return;
    }

    //bug check context
    if (context.SYNC_SERVICE_SID === undefined) {
      response.setBody("Error, missing keys from context");
      response.setStatusCode(500);
      callback(null, response);
      return;
    }

    // parse identity, check roles and parse mapId/workerIdentity from request
    const workerIdentity = event.TokenResult.identity;
    const docName = "CallbackMaps_" + workerIdentity;
    const service = context
      .getTwilioClient()
      .sync.services(context.SYNC_SERVICE_SID);

    try {
      //check doc exists
      await service.documents(docName).fetch();
    } catch (e) {
      //doc not there so create
      try {
        await service.documents.create({
          uniqueName: docName,
          data: {
            callbackMapIds: [],
            config: { playSoundOnMapItemAdded: false },
          },
        });
      } catch (e) {
        //bad
        callback(e);
        return;
      }
    }

    try {
      //try updating permissions
      await service
        .documents(docName)
        .documentPermissions(workerIdentity)
        .update({ read: true, write: false, manage: false });

      //good response if executes
      response.setStatusCode(201);
      callback(null, response);
    } catch (e) {
      //bad response otherwise
      callback(e);
    }
  }
);
