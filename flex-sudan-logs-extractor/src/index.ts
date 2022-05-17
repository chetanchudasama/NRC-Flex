import init from "twilio";
import { Client } from "@microsoft/microsoft-graph-client";
import ROPCAuthenticationProvider from "./msal-auth/ROPCAuthenticationProvider";
import { getWorkers } from "./workers";
import { getTimeoutItems } from "./timeouts";
import { getCallBackItems } from "./callbackitems";
import Configuration from "./configuration";
import "isomorphic-fetch";
import { exportToCsv, uploadToSharepoint } from "./uploading-tools";
import { getCallLogs } from "./calls";
import { moveToArchiveAndDelete } from "./util";
import { CallbackMapItem } from "./models";

const main = async () => {
  const now = new Date();
  console.log(`START @ ${now.toUTCString()}`);

  console.log("generate from / to dates");
  const fromDate = new Date(Date.UTC(Configuration.range.fromYear, Configuration.range.fromMonth -1, Configuration.range.fromDay));
  fromDate.setMinutes(fromDate.getMinutes() + Configuration.range.offsetUTCInMinutes);

  const untilDate = new Date(Date.UTC(Configuration.range.toYear, Configuration.range.toMonth -1, Configuration.range.toDay, 23, 59, 59, 999));
  untilDate.setMinutes(untilDate.getMinutes() + Configuration.range.offsetUTCInMinutes);    

  console.log(`will export call logs data from: ${fromDate.toISOString()} to: ${untilDate.toISOString()}`);

  console.log("Initialising Twilio Client");
  const client = init(
    Configuration.twilio.apiKey,
    Configuration.twilio.apiSecret,
    {
      accountSid: Configuration.twilio.accountSid,
    }
  );

  const workspaceSid = Configuration.twilio.workspaceSid;

  const graphClient = Client.initWithMiddleware({
    authProvider: new ROPCAuthenticationProvider(),
  });

  const upload = uploadToSharepoint(graphClient);

  let filePrefix = "worker-details";
  const workers = await getWorkers(client, workspaceSid);
  const workersExport = await exportToCsv(filePrefix, false, workers);
  if (workersExport) {
    await upload(
      Configuration.sharepoint.dataDriveId,
      Configuration.sharepoint.dataFolderName,
      workersExport.fileName,
      workersExport.csvString
    );
  }

  filePrefix = "timeouts";
  const timeoutItems = await getTimeoutItems(client);
  const timeoutsExport = await exportToCsv(
    filePrefix,
    true,
    timeoutItems
  );
  if (timeoutsExport) {
    
    await upload(
      Configuration.sharepoint.dataDriveId,
      Configuration.sharepoint.dataFolderName,
      timeoutsExport.fileName,
      timeoutsExport.csvString,
    );
    await moveToArchiveAndDelete(
      client, 
      timeoutItems, 
      Configuration.twilio.timeoutArchiveMapSid);
  }

  filePrefix = "callback-items";
  const callbackItems = await getCallBackItems(client);
  const callBackItemsExport = await exportToCsv(
    filePrefix,
    true,
    callbackItems.map(e => e.mapItemData)
  );
  if (callBackItemsExport) {
    await upload(
      Configuration.sharepoint.dataDriveId,
      Configuration.sharepoint.dataFolderName,
      callBackItemsExport.fileName,
      callBackItemsExport.csvString,
    );
    await moveToArchiveAndDelete(
      client, 
      callbackItems, 
      Configuration.twilio.callbackArchiveMapSid);
  }

  filePrefix = "calls";
  const callItems = await getCallLogs(client, fromDate, untilDate);
  const callsExport = await exportToCsv(
    filePrefix,
    true,
    callItems);
  if (callsExport) {
    await upload(
      Configuration.sharepoint.dataDriveId,
      Configuration.sharepoint.dataFolderName,
      callsExport.fileName,
      callsExport.csvString
    );
  }

  console.log(`DONE @ ${new Date().toUTCString()}`);
};

main()
  .then(() => {
    console.log("EXIT: 0");
    process.exit(0);
  })
  .catch((err) => {
    console.error("ERROR");
    console.error(err);
    process.exit(999);
  });
