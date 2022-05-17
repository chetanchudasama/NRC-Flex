import { json2csvAsync } from "json-2-csv";
import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";

const generateNowUTCDateString = () => {
  const date = new Date();

  let monthStr = (date.getUTCMonth() + 1).toString();
  if (monthStr.length < 2) monthStr = "0" + monthStr;

  let dayStr = (date.getUTCDate()).toString();
  if (dayStr.length < 2) dayStr = "0" + dayStr;

  let hourStr = date.getUTCHours().toString();
  if(hourStr.length < 2) hourStr = "0" + hourStr;

  let minStr = date.getUTCMinutes().toString();
  if(minStr.length < 2) minStr = "0" + minStr;

  let secString = date.getUTCSeconds().toString();
  if(secString.length < 2) secString = "0" + secString;

  return `${date.getUTCFullYear()}-${monthStr}-${dayStr}T${hourStr}-${minStr}-${secString}`;
}

export const exportToCsv = async (
  fileNamePrefix: string,
  appendCurrentUTCDateTime: boolean,
  items: object[]
) => {
  if (!items || items.length < 1) {
    console.log("No items in collection, skipping export");
    return;
  }

  console.log("Converting to CSV");
  const csvString = await json2csvAsync(items);

  const fileName = appendCurrentUTCDateTime
  ? `${fileNamePrefix}-${generateNowUTCDateString()}.csv`
  : `${fileNamePrefix}.csv`;

  return { csvString, fileName };
};

export const uploadToSharepoint = (client: Client) => async (
  driveId: string,
  folderName: string,
  fileName: string,
  fileData: string
) => {
  console.log("Uploading to SharePoint");
  await client
    .api(`/drives/${driveId}/root:/${folderName}/${fileName}:/content`)
    .header("Content-Type", "text/plain")
    .put(fileData);
};