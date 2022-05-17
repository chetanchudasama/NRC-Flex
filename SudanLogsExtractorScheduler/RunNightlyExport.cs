using System;
using System.Collections.Generic;
using Microsoft.Azure.Management.ContainerInstance.Fluent.Models;
using Microsoft.Azure.Management.ResourceManager.Fluent;
using Microsoft.Azure.Management.ResourceManager.Fluent.Authentication;
using Microsoft.Azure.Management.ResourceManager.Fluent.Core;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SudanLogsExtractorScheduler.Models;

namespace SudanLogsExtractorScheduler
{
    public class RunNightlyExport
    {
        private readonly IOptions<Settings> settings;
        public RunNightlyExport(IOptions<Settings> settings)
        {
            this.settings = settings;
        }

        /// <summary>
        /// runs at 00:05:00 UTC every day.
        /// this will be 02:05:00 Sudan time (Central Africa Time).
        /// creates a new run of the image using ACI to export the days logs
        /// </summary>
        /// <param name="myTimer"></param>
        /// <param name="log"></param>
        [FunctionName(nameof(RunNightlyExport))]
        public void Run([TimerTrigger("0 5 0 * * *")]TimerInfo myTimer, ILogger log)
        {
            DateTime nowUtc = DateTime.UtcNow;
            log.LogInformation($"C# Timer trigger function executed at: {nowUtc} UTC");

            //get total offset for time zone in minutes, used to get full day of records from twilio in "local" timezone
            TimeZoneInfo info = TimeZoneConverter.TZConvert.GetTimeZoneInfo("Africa/Tripoli");
            double utcOffesetInMinutes = info.GetUtcOffset(nowUtc).TotalMinutes;

            //set to day/month/year to today and from to yesterday
            int toDay = nowUtc.Day; //1-31
            int toMonth = nowUtc.Month; //1-12
            int toYear = nowUtc.Year; //1-9999
            nowUtc = nowUtc.AddDays(-1);
            int fromDay = nowUtc.Day; //1-31
            int fromMonth = nowUtc.Month; //1-12
            int fromYear = nowUtc.Year; //1-9999

            log.LogInformation("Connecting to Azure Management API");
            AzureCredentialsFactory factory = new AzureCredentialsFactory();
            AzureCredentials msiCred = factory.FromSystemAssignedManagedServiceIdentity(MSIResourceType.AppService, AzureEnvironment.AzureGlobalCloud);
            var azure = Microsoft.Azure.Management.Fluent.Azure.Configure()
                .WithLogLevel(HttpLoggingDelegatingHandler.Level.Basic)
                .Authenticate(msiCred)
                .WithSubscription(settings.Value.AZURE_ACI_SUBSCRIPTION_ID);

            log.LogInformation("Gathering Resource Group");
            IResourceGroup resGroup = azure.ResourceGroups.GetByName(settings.Value.AZURE_ACI_RESOURCE_GROUP_NAME);

            log.LogInformation("About to create new ACI instance");
            string cgName = $"cg-twilio-logs-extractor-libya".ToLower();
            if (cgName.Length > 63)
            {
                cgName = cgName.Substring(0, 63);
            }
            var cName = cgName.Substring(3);

            var containerGroup = azure.ContainerGroups
                .Define(cgName)
                .WithRegion(resGroup.Region)
                .WithExistingResourceGroup(resGroup)
                .WithLinux()
                .WithPrivateImageRegistry(settings.Value.AZURE_ACR_SERVER, settings.Value.AZURE_ACR_USERNAME, settings.Value.AZURE_ACR_PASSWORD)
                .WithoutVolume()
                .DefineContainerInstance(cName)
                .WithImage($"{settings.Value.AZURE_ACR_SERVER}/{settings.Value.AZURE_ACR_IMAGE_NAME}:{settings.Value.AZURE_ACR_IMAGE_TAG}")
                .WithoutPorts()
                .WithCpuCoreCount(1)
                .WithMemorySizeInGB(1)
                .WithEnvironmentVariablesWithSecuredValue(new Dictionary<string, string>() {
                    {"TWILIO_API_SECRET", settings.Value.TWILIO_API_SECRET},
                    {"GRAPH_PASSWORD", settings.Value.GRAPH_PASSWORD}
                })
                .WithEnvironmentVariables(new Dictionary<string, string>()
                {
                    {"TWILIO_ACCOUNT_SID", settings.Value.TWILIO_ACCOUNT_SID},
                    {"TWILIO_API_KEY", settings.Value.TWILIO_API_KEY},
                    {"TWILIO_FLOW_SID", settings.Value.TWILIO_FLOW_SID},
                    {"TWILIO_TASKROUTER_WORKSPACE_SID", settings.Value.TWILIO_TASKROUTER_WORKSPACE_SID},
                    {"TWILIO_SYNC_SERVICE_SID", settings.Value.TWILIO_SYNC_SERVICE_SID},
                    {"TWILIO_TIMEOUT_SYNC_MAP_SID", settings.Value.TWILIO_TIMEOUT_SYNC_MAP_SID},
                    {"TWILIO_CALLBACK_ARCHIVE_MAP_SID", settings.Value.TWILIO_CALLBACK_ARCHIVE_MAP_SID},
                    {"TWILIO_TIMEOUT_ARCHIVE_MAP_SID", settings.Value.TWILIO_TIMEOUT_ARCHIVE_MAP_SID},
                    {"GRAPH_TENANT_ID", settings.Value.GRAPH_TENANT_ID},
                    { "GRAPH_CLIENT_ID", settings.Value.GRAPH_CLIENT_ID},
                    { "GRAPH_SCOPE", "files.readwrite.all"},
                    { "GRAPH_USERNAME", settings.Value.GRAPH_USERNAME},
                    { "SHAREPOINT_DATA_DRIVE_ID", settings.Value.SHAREPOINT_DATA_DRIVE_ID},
                    { "SHAREPOINT_DATA_FOLDER_NAME", settings.Value.SHAREPOINT_DATA_FOLDER_NAME},
                    { "RANGE_FROM_DAY", fromDay.ToString()},
                    { "RANGE_FROM_MONTH", fromMonth.ToString()},
                    { "RANGE_FROM_YEAR", fromYear.ToString()},
                    { "RANGE_TO_DAY", toDay.ToString()},
                    { "RANGE_TO_MONTH", toMonth.ToString()},
                    { "RANGE_TO_YEAR", toYear.ToString()},
                    { "RANGE_UTC_OFFSET_IN_MINUTES", utcOffesetInMinutes.ToString()}
                })
                .Attach()
                .WithRestartPolicy(ContainerGroupRestartPolicy.Never)
                .Create();

            log.LogInformation("ACI instance created");
            log.LogInformation(containerGroup.Id);
        }
    }
}
