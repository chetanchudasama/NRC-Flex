using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SudanLogsExtractorScheduler.Models;

[assembly: FunctionsStartup(typeof(SudanLogsExtractorScheduler.Startup))]

namespace SudanLogsExtractorScheduler
{
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder builder)
        {
            builder.Services.AddOptions<Settings>().Configure<IConfiguration>((settings, configuration) =>
            {
                configuration.GetSection(nameof(Settings)).Bind(settings);
            });
        }
    }
}
