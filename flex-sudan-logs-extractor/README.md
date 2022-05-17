# Twilio Log Extractor - NRC Sudan

## Overview
This project contains the log extractor originally from NRC Libya that has been modified to get items from sync-maps instead of call logs. It contains a folder/ functions to get items from a message back map and a timeout map. As well as this it also contains an archive function in the utils file that moves items to an archive map and deletes them. Finally it contains a few functions in the generate fake data file to generate fake data to allow better testing of the power BI reports.

Exported files are generated for a specified day to a specificed directory. One CSV file will be generated for each export. These CSV files are then uploaded to the NRC Sudan data export directory which is then fed into the power BI reports for this country.

Note: if no values exist for a export the CSV file will not be generated.

## Setup
The deployment and running of the program locally is covered further in the build section however this section is going to cover how to retreive some env values as it is not obvious.

For the GRAPH_xxxx env variables, these should be easy enough to find. Create a new user to be the uploader of these files and place the user name and password into the env. Then get the tenant and client ID that can be found from within the azure portal after creating a new application for this app. Finally the scope can be left unchanged unless you are running into permission issues, then these may need to be reconfigured.

Finally for the SHAREPOINT_xxxx ID's, these are the hardest to find but here is a quick guide.
- Load up the Microsoft Graph API
- Sign in as a user who has access
- Run the search sites **POST** request with a key word relating to the drive/site you wish to find (e.g run with NRC Sudan in the search form body)
    - NOTE: There are two search sites template requests in the graph api explorer. Don't get caught out - you want the one that is a post request not a get request!
- This should return a list of your sites you have access to with the one you want to upload to
- For the one you want to upload to - make a note of the second/ sub site id. One of the attributes should look something like this so save the middle one (zingdev.sharepoint.com,SUBSITEID,ROOTSITEIDORSOMETHINGBUTYOUDONTNEEDTHISONE)
- Once you have this. Run this request in the Graph explorer `https://graph.microsoft.com/v1.0/sites/>[YOUR SUB SITE ID]/drives`
- This should then list every drive available
- Once you have found the drive you wish to upload too, take its drive ID and add it to the env (Should start with `b!`)

Once you have all of those you should be set for building and deploying

## Build

To build the project first install the dependancies by running `npm i`. You can then run `npm run build` to build the applicaiton.

The build output will be in the `/build` directory.

Before runnning the built application you must then make sure to have a value for all named environment variables listed in the `.env.example` file setup in your terminal (See above step if help for this step required).

You can trigger the application by running the `index.js` file from node.

Note: there are two required command line parameters you must parse, for more details on this run `node index.js --help` to view the help file.

## Local Development

To run locally, copy the `.env.example` file and rename it to `.env`. 

Update the file with the required environment variables, run `npm i` to install the dependancies and run the program in watch mode by running the command `npm run start`.