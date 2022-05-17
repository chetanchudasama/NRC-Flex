import { Twilio } from "twilio";
import Configuration from "./configuration";
import { CallbackMapItem } from "./models";
import { MapItemWrapper } from "./util";

const getMapSidsInUse = async (client: Twilio):Promise<string[]> =>{
  const callBackDoc = await client.sync.services(Configuration.twilio.syncServiceSid)
         .documents("CallbackMaps")
         .fetch();
  const items = Array.isArray(callBackDoc?.data?.callbackMaps) ? callBackDoc.data.callbackMaps : [];
  const res: string[] = [];
  items.forEach((e: any) => {
    if(typeof(e.sid) === "string"){
      res.push(e.sid);
    }
  });
  return res;
}

//gets all complete items and exports them to a csv
export const getCallBackItems = async (
  client: Twilio,
): Promise<MapItemWrapper[]> => {
  
  console.log("getting number of callback maps to read from");
  const mapSids = await getMapSidsInUse(client);
  const items: MapItemWrapper[] = [];

  var msl = mapSids.length;
  console.log(`${msl} maps to loop over, starting loop`);

  for(var msi = 0; msi < msl; msi++){
    const mapSid = mapSids[msi];
    console.log(`Getting Callback Items made from Map: ${mapSid}`);
    const callbackItems: any[] = await client.sync
      .services(Configuration.twilio.syncServiceSid)
      .syncMaps(mapSid)
      .syncMapItems.list({ pageSize: 100 });
    const completedItems: any[] = callbackItems.filter(
      (item) => item.data.completed
    );
    const length = completedItems.length;
    for (let i = 0; i < length; i++) {
      console.log(
        `[${i + 1} of ${length}] - Processing Callback Item ${
          completedItems[i].key
        }`
      );

      //push a new row for the message back item
      const newItem: CallbackMapItem = {
        itemKey: completedItems[i].key,
        createdAt: completedItems[i].dateCreated.toISOString(),
        completedAt: completedItems[i].data.completedAt,
        completedBy: completedItems[i].data.completedBy,
        phoneNumber: completedItems[i].data.phoneNumber,
        attempts: completedItems[i].data.attempts,
        language: completedItems[i].data.language,
        location: completedItems[i].data.location,
        helpOption: completedItems[i].data.helpOption,
        callerType: completedItems[i].data.callerType,
        isComplaint: completedItems[i].data.isComplaint,
        priority: completedItems[i].data.priority
      };

      items.push({
        mapSid,
        mapItemKey: newItem.itemKey,
        mapItemData: newItem
      });
    }
  }

  return items;
};