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
  TASKROUTER_WORKSPACE_SID?: string;
};

/**
 * public twilio function exposed on the /listworkers path.
 * protected via flex token (any user).
 * returns an object with a JSON array of the workers in the task router workspace
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
      response.setBody("Error, missing fields from event");
      response.setStatusCode(400);
      callback(null, response);
      return;
    }

    //bug check context
    if (context.TASKROUTER_WORKSPACE_SID === undefined) {
      response.setBody("Error, missing keys from context");
      response.setStatusCode(500);
      callback(null, response);
      return;
    }

    // parse identity, check roles
    const userRoles = event.TokenResult.roles;
    if (
      !Array.isArray(userRoles) ||
      userRoles.findIndex((e) => e === "admin" || e === "supervisor") === -1
    ) {
      response.setBody("permission denied: admin / supervisor role missing");
      response.setStatusCode(403);
      callback(null, response);
      return;
    }

    try {
      //all good, is admin or supervisor (return results)
      const client = context.getTwilioClient();

      const workers = await client.taskrouter
        .workspaces(context.TASKROUTER_WORKSPACE_SID)
        .workers.list();

      response.setBody({ workers });
      response.setStatusCode(200);
      callback(null, response);
    } catch (e) {
      //bad
      callback(e);
    }
  }
);
