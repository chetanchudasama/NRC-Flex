declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: string;
    TWILIO_ACCOUNT_SID: string;
    TWILIO_API_KEY: string;
    TWILIO_API_SECRET: string;
    TWILIO_TASKROUTER_WORKSPACE_SID: string;
    TWILIO_SYNC_SERVICE_SID: string;
    TWILIO_TIMEOUT_SYNC_MAP_SID: string;
    TWILIO_CALLBACK_ARCHIVE_MAP_SID: string;
    TWILIO_TIMEOUT_ARCHIVE_MAP_SID: string;
    GRAPH_TENANT_ID: string;
    GRAPH_CLIENT_ID: string;
    GRAPH_SCOPE: string;
    GRAPH_USERNAME: string;
    GRAPH_PASSWORD: string;
    SHAREPOINT_DATA_DRIVE_ID: string;
    SHAREPOINT_DATA_FOLDER_NAME: string;
    RANGE_FROM_DAY?:string;
    RANGE_FROM_MONTH?:string;
    RANGE_FROM_YEAR?:string;
    RANGE_TO_DAY?:string;
    RANGE_TO_MONTH?:string;
    RANGE_TO_YEAR?:string;
    RANGE_UTC_OFFSET_IN_MINUTES?:string;
  }
}
