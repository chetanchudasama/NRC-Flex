import dotenv from "dotenv";

console.log("loading environment config from .env");
dotenv.config();

const Configuration = {
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    apiKey: process.env.TWILIO_API_KEY,
    apiSecret: process.env.TWILIO_API_SECRET,
    workspaceSid: process.env.TWILIO_TASKROUTER_WORKSPACE_SID,
    syncServiceSid: process.env.TWILIO_SYNC_SERVICE_SID,
    timeoutMapSid: process.env.TWILIO_TIMEOUT_SYNC_MAP_SID,
    callbackArchiveMapSid: process.env.TWILIO_CALLBACK_ARCHIVE_MAP_SID,
    timeoutArchiveMapSid: process.env.TWILIO_TIMEOUT_ARCHIVE_MAP_SID
  },
  graph: {
    tenantId: process.env.GRAPH_TENANT_ID,
    clientId: process.env.GRAPH_CLIENT_ID,
    scope: process.env.GRAPH_SCOPE,
    username: process.env.GRAPH_USERNAME,
    password: process.env.GRAPH_PASSWORD,
  },
  sharepoint: {
    dataDriveId: process.env.SHAREPOINT_DATA_DRIVE_ID,
    dataFolderName: encodeURIComponent(process.env.SHAREPOINT_DATA_FOLDER_NAME),
  },
  range: {
    fromDay: Number.parseInt(process.env.RANGE_FROM_DAY || "1"),
    fromMonth: Number.parseInt(process.env.RANGE_FROM_MONTH || "1"),
    fromYear: Number.parseInt(process.env.RANGE_FROM_YEAR || "2021"),
    toDay: Number.parseInt(process.env.RANGE_TO_DAY || "1"),
    toMonth: Number.parseInt(process.env.RANGE_TO_MONTH || "1"),
    toYear: Number.parseInt(process.env.RANGE_TO_YEAR || "2021"),
    offsetUTCInMinutes: Number.parseInt(process.env.RANGE_UTC_OFFSET_IN_MINUTES || "0")
  }
};

export default Configuration;
