import { Twilio } from "twilio";
import Configuration from "./configuration";
import { CallbackMapItem, TimeoutMapItem } from "./models";

export type MapItemWrapper = {
  mapSid: string;
  mapItemKey: string;
  mapItemData: CallbackMapItem|TimeoutMapItem;
}

export const delay = (delayInMs: number): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(resolve, delayInMs);
  });
};

export const formatDate = (date: Date) => {
  let monthStr = (date.getMonth() + 1).toString();
  if (monthStr.length < 2) monthStr = "0" + monthStr;

  let dayStr = date.getDate().toString();
  if (dayStr.length < 2) dayStr = "0" + dayStr;

  return `${date.getFullYear()}-${monthStr}-${dayStr}`;
};

export const removeChannelPrefix = (phoneNumber: string): string => {
  if (phoneNumber.startsWith("whatsapp")) {
    return phoneNumber.substring(9);
  } else if (phoneNumber.startsWith("tsms")) {
    return phoneNumber.substring(5);
  } else {
    return phoneNumber;
  }
};

//runs through map, move to an archive map with a ttl of 2 month and the old item should be deleted
export const moveToArchiveAndDelete = async (
  client: Twilio,
  items: MapItemWrapper[],
  archiveMapSid: string,
): Promise<void> => {

  //loop through and for each item
  //clone the item into the new map with ttl 3 months or 7,890,000 seconds
  //delete the old item
  const length = items.length;
  for (let i = 0; i < length; i++) {
    //fetch item
    const currentItem = items[i];
    console.log(`[${i + 1} of ${length}] - Archiving item ${currentItem.mapItemKey} from map ${currentItem.mapSid}`);

    //clone item into new map
    await client.sync
      .services(Configuration.twilio.syncServiceSid)
      .syncMaps(archiveMapSid)
      .syncMapItems.create({
        key: currentItem.mapItemKey,
        data: {
          ...currentItem.mapItemData,
        },
        itemTtl: 7890000,
      });

    //delete item
    await client.sync
      .services(Configuration.twilio.syncServiceSid)
      .syncMaps(currentItem.mapSid)
      .syncMapItems(currentItem.mapItemKey)
      .remove();
  }
};
