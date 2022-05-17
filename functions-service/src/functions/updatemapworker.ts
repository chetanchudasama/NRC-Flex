// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";
import { ServiceContext } from "twilio/lib/rest/sync/v1/service";

type MyEvent = {
  TokenResult?: any;
  MapId?: string;
  WorkerIdentity?: string;
  Action?: string;
};

type MyContext = {
  SYNC_SERVICE_SID?: string;
  TASKROUTER_WORKSPACE_SID?: string;
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
    if (
      event.TokenResult === undefined ||
      event.MapId === undefined ||
      event.WorkerIdentity === undefined ||
      event.Action === undefined
    ) {
      response.setBody("Error, missing fields from event");
      response.setStatusCode(400);
      callback(null, response);
      return;
    }

    //bug check context
    if (
      context.TASKROUTER_WORKSPACE_SID === undefined ||
      context.SYNC_SERVICE_SID === undefined
    ) {
      response.setBody("Error, missing keys from context");
      response.setStatusCode(500);
      callback(null, response);
      return;
    }

    // parse identity, check roles and parse mapId/workerIdentity from request
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

    const service = context
      .getTwilioClient()
      .sync.services(context.SYNC_SERVICE_SID);

    if (event.Action === "add") {
      //for add, update permissions first, then trigger update on doc (to notify client need to sync new map)
      try {
        await service
          .syncMaps(event.MapId)
          .syncMapPermissions(event.WorkerIdentity)
          .update({ read: true, write: true, manage: false });

        await updateWorkerDocument(
          service,
          event.WorkerIdentity,
          event.MapId,
          "add"
        );
      } catch (e) {
        callback(e);
        return;
      }
    } else if (event.Action === "remove") {
      //for remove, update doc first (so active client will stop listening to map) and remove underlying permission
      try {
        await updateWorkerDocument(
          service,
          event.WorkerIdentity,
          event.MapId,
          "remove"
        );

        await service
          .syncMaps(event.MapId)
          .syncMapPermissions(event.WorkerIdentity)
          .remove();
      } catch (e) {
        callback(e);
        return;
      }
    } else {
      //if control gets here invalid action
      response.setBody(
        'invalid request: action must be one of: "add" or "remove"'
      );
      response.setStatusCode(400);
      callback(null, response);
      return;
    }

    //if it gets to hear function has run successfully
    response.setStatusCode(200);
    callback(null, response);
  }
);

async function updateWorkerDocument(
  service: ServiceContext,
  workerIdentity: string,
  mapId: string,
  action: "add" | "remove"
) {
  //read doc / create new
  const docName = "CallbackMaps_" + workerIdentity;
  let doc;
  try {
    //try fetching
    doc = await service.documents(docName).fetch();
  } catch (err) {
    //create doc since not found
    doc = await service.documents.create({
      uniqueName: docName,
      data: { callbackMapIds: [], config: { playSoundOnMapItemAdded: false } },
    });

    //new doc, set permissions so worker can read it
    await service
      .documents(docName)
      .documentPermissions(workerIdentity)
      .update({ read: true, write: false, manage: false });
  }

  //Change doc data (add/remove mapId from callbackMapIds)
  if (action === "add") {
    //add called
    doc.data.callbackMapIds = [...(doc.data.callbackMapIds || []), mapId];
  } else {
    //remove called
    const matchedIndex = (doc.data.callbackMapIds || []).findIndex(
      (mId: string) => mId === mapId
    );

    //if it finds an index splice the array
    if (matchedIndex !== -1) {
      doc.data.callbackMapIds.splice(matchedIndex, 1);
    }
  }

  //now call the update with the new data
  await service
    .documents(docName)
    .update({ data: doc.data, ifMatch: doc.revision });
}
