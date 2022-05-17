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
  PlaySoundOnMapItemAdded?: string;
};

type MyContext = {
  SYNC_SERVICE_SID?: string;
};

/**
 * public twilio function exposed on the /updatemapworkerconfig path.
 * updates the workers config/sync doc
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
    if (
      event.TokenResult === undefined ||
      event.PlaySoundOnMapItemAdded === undefined
    ) {
      response.setBody("Error, missing fields from event");
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

    //parse / convert event
    const playSoundOnMapItemAdded =
      event.PlaySoundOnMapItemAdded === "true" ? true : false;
    const workerIdentity = event.TokenResult.identity;

    if (!workerIdentity) {
      response.setStatusCode(400);
      response.setBody("invalid request: workerIdentity is missing");
      callback(null, response);
      return;
    }

    // get service + doc name
    const service = context
      .getTwilioClient()
      .sync.services(context.SYNC_SERVICE_SID);
    const docName = "CallbackMaps_" + workerIdentity;

    try {
      //fetch doc
      const doc = await service.documents(docName).fetch();

      //update config with event value
      if (!doc.data.config) {
        doc.data.config = {};
      }
      doc.data.config.playSoundOnMapItemAdded = playSoundOnMapItemAdded;

      //update doc
      await service.documents(docName).update({
        data: doc.data,
        ifMatch: doc.revision,
      });

      //good response if here
      response.setStatusCode(200);
      callback(null, response);
    } catch (e) {
      //bad
      callback(e);
    }
  }
);
