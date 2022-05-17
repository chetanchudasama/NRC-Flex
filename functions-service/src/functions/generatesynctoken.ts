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
  ACCOUNT_SID?: string;
  SYNC_SERVICE_SID?: string;
  SYNC_API_KEY?: string;
  SYNC_API_SECRET?: string;
};

/**
 * public twilio function exposed on the /generatesynctoken path.
 * return a sync access token to the requester if they present a valid Twilio Flex token
 * @param {*} context
 * @param {*} event
 * @param {*} callback
 */

const AccessToken = require("twilio").jwt.AccessToken;
const SyncGrant = AccessToken.SyncGrant;
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

    // Create a "grant" identifying the Sync service instance for this app.
    var syncGrant = new SyncGrant({
      serviceSid: context.SYNC_SERVICE_SID,
    });

    // Create an access token which we will sign and return to the client,
    // containing the grant we just created and specifying his identity.
    var token = new AccessToken(
      context.ACCOUNT_SID,
      context.SYNC_API_KEY,
      context.SYNC_API_SECRET
    );
    token.addGrant(syncGrant);
    //set token identity to match logged in flex user
    token.identity = event.TokenResult.identity;

    response.setBody({ token: token.toJwt() });

    // Serialize the token to a JWT string and include it in a JSON response
    callback(null, response);
  }
);
