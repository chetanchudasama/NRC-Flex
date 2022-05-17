# NRC Sudan Flex Implementation

## Overview 

NRC Sudan flex implementation. This repo contains a functions service, flex plugin and twilio studio flows.

## Directory

- Functions Service Read Me : [Link](./functions-service/README.md)
- Flex Plugin Read Me: [Link](./plugin-nrc-sudan-flex/README.md)

## Deployment

### Sync Service
1. Create a new Twilio Sync Service using the command below:
    ```bash
    twilio api:sync:v1:services:create /
    --friendly-name "Callbacks Service"  /
    --acl-enabled
    ```
    Make a note of the generated SID you will need this for the following commands and also when setting up the functions service.

2. Create the following sync maps/docs, make a note of each SID generated as you will need some of these when setting up the functions service.
    ```bash
    #note: replace placeholders <...> first

    #main items maps
    twilio api:sync:v1:services:maps:create /
    --service-sid <IS...> /  #service sid from previous step
    --unique-name NRCSudanEnglish

    twilio api:sync:v1:services:maps:create /
    --service-sid <IS...> /  #service sid from previous step
    --unique-name NRCSudanArabic

    twilio api:sync:v1:services:maps:create /
    --service-sid <IS...> /  #service sid from previous step
    --unique-name NRCSudanTigrinya

    twilio api:sync:v1:services:maps:create /
    --service-sid <IS...> /  #service sid from previous step
    --unique-name NRCSudanAmharic

    #callback maps document (used for admin control)
    twilio api:sync:v1:services:documents:create /
    --service-sid <IS...> / #service sid from previous step
    --unique-name CallbackMaps /
    --data="{\"callbackMaps\":[{\"uniqueName\": \"NRCSudanEnglish\", \"friendlyName\": \"English Requests\", \"sid\": \"<MP...>\"},{\"uniqueName\": \"NRCSudanArabic\", \"friendlyName\": \"Arabic Requests\", \"sid\": \"<MP...>\"},{\"uniqueName\": \"NRCSudanTigrinya\", \"friendlyName\": \"Tigrinya Requests\", \"sid\": \"<MP...>\"},{\"uniqueName\": \"NRCSudanAmharic\", \"friendlyName\": \"Amharic Requests\", \"sid\": \"<MP...>\"}]}" #map sids from previous step

    #timeout map
    twilio api:sync:v1:services:maps:create /
    --service-sid <IS...> /  #service sid from previous step
    --unique-name NRCSudanIVRTimeout
    ```

3. Use the Twilio console to generate a new standard API Key and Secret. You will need these in the .env file when deploying the functions service.

### Functions Service
To deploy the functions after completing the other prior steps:
1) Run `cd functions-service` to navigate into the correct directory
2) Duplicate the `.env.example` file and rename to `.env`
3) Throughout the prior steps you have been making notes of various sids - now you can use these to help you fill out the values in the `.env`
4) Once you have done these steps run `npm i` and then `npm run deploy` and you will have deployed the functions ready for use

### Flow
To deploy the flow and final step, copy the contents of the [Sudan-IVR.json](./flows/Sudan-IVR.json) file and paste it into a new Studio flow via the Twilio Console.

Next you need to update the three Twilio Function calls to point to the functions that you deployed in the previous step.

## Getting Started Developing

### Twilio CLI
https://www.twilio.com/docs/twilio-cli/quickstart

You will need access to the NRC Sudan Dev twilio accout, so that you can use the Account sid and Auth token to login to the correct Twilio profile in the CLI.

Be sure to update the Twilio CLI to the latest version.
```bash
# Update the Twilio CLI
npm install twilio-cli@latest -g

# Login to Twilio account
twilio login

# After logging in, switch to correct profile
twilio profiles:use <YOUR-NRC-SUDAN-NAME>

```
### Plugin

Inside the flex plugin, you'll need to install the dependencies before you'll be able to run the plugin.

Read more on the flex plugin [here](plugin-nrc-venezuela-flex/README.md)


```bash
# Install dependencies
npm i

# Start the flex plugin
twilio flex:plugins:start

```

### Twilio Functions

The Version of Twilio has in the dependencies has to be at least version 3.6