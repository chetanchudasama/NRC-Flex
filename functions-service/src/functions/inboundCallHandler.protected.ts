// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

//incoming events from a phone call
type MyEvent = {
  Called?: string;
  ToState?: string;
  Direction?: string;
  To?: string;
  From?: string;
};

//NRC Sudan studio flow sid
type MyContext = {
  STUDIO_FLOW_SID?: string;
};

export const handler: ServerlessFunctionSignature = function (
  context: Context<MyContext>,
  event: MyEvent,
  callback: ServerlessCallback
) {
  if (isOutOfHours()) {
    const twiml = new Twilio.twiml.VoiceResponse();
    twiml.say(
      "Sorry, you called out of hours, please call again between 8am and 4pm"
    );
    twiml.hangup();
    return callback(null, twiml);
  }
  //handup phone call, start the studio flow
  const client = context.getTwilioClient();
  const twiml = new Twilio.twiml.VoiceResponse();
  twiml.hangup();

  setTimeout(async () => {
    const execution = await client.studio
      .flows(context.STUDIO_FLOW_SID!)
      .executions.create({
        to: event.From!,
        from: event.To!,
      });
    callback(null, twiml);
  }, 3000);
};

// Returns true when today is outside of the working hours for the company
function isOutOfHours() {
  const now = new Date();

  //Open 7 days a week, from 8am - 4pm

  // Sudan is in Central African Time (GMT + 2)
  // So in UTC it's 6am - 2pm

  const opens = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6);
  if (now < opens) {
    // now before opens therefore closed
    console.log(now);
    console.log(opens);

    return true;
  }

  const closes = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14);
  if (now >= closes) {
    // now after closes therefore closed
    console.log(now);
    console.log(closes);
    return true;
  }

  //Any other situation it's open
  return false;
}
