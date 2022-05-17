using System;
using System.Collections.Generic;
using System.Text;

namespace SudanLogsExtractorScheduler.Models
{
    public class Settings
    {
        public string TWILIO_ACCOUNT_SID { get; set; }
        public string TWILIO_API_KEY { get; set; }
        public string TWILIO_API_SECRET { get; set; }
        public string TWILIO_FLOW_SID { get; set; }
        public string TWILIO_TASKROUTER_WORKSPACE_SID { get; set; }
        public string TWILIO_SYNC_SERVICE_SID { get; set; }
        public string TWILIO_TIMEOUT_SYNC_MAP_SID { get; set; }
        public string TWILIO_CALLBACK_ARCHIVE_MAP_SID { get; set; }
        public string TWILIO_TIMEOUT_ARCHIVE_MAP_SID { get; set; }
        public string GRAPH_TENANT_ID { get; set; }
        public string GRAPH_CLIENT_ID { get; set; }
        public string GRAPH_USERNAME { get; set; }
        public string GRAPH_PASSWORD { get; set; }
        public string SHAREPOINT_DATA_DRIVE_ID { get; set; }
        public string SHAREPOINT_DATA_FOLDER_NAME { get; set; }
        public string AZURE_ACI_SUBSCRIPTION_ID { get; set; }
        public string AZURE_ACI_RESOURCE_GROUP_NAME { get; set; }
        public string AZURE_ACR_SERVER { get; set; }
        public string AZURE_ACR_USERNAME { get; set; }
        public string AZURE_ACR_PASSWORD { get; set; }
        public string AZURE_ACR_IMAGE_NAME { get; set; }
        public string AZURE_ACR_IMAGE_TAG { get; set; }
    }
}