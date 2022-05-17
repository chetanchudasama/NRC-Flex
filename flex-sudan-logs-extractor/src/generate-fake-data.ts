import { CallbackMapItem, CallLeg, TimeoutMapItem } from "./models";
import moment from "moment";
import { formatDate } from "./util";

//generates/ returns N fake timeout items
export const generateFakeTimeoutItems = (
  fromDate: Date,
  untilDate: Date,
  numberItems: number
): TimeoutMapItem[] => {
  console.log(
    `Creating Dummy Timeout Items made from: ${formatDate(
      fromDate
    )} to ${formatDate(untilDate)}`
  );

  const items: TimeoutMapItem[] = [];
  const keyPart = moment().toISOString();
  //create N dummy items
  for (let i = 0; i < numberItems; i++) {
    const isTimeoutItem = Math.floor(Math.random() * 5) > 0;
    const newItem: TimeoutMapItem = {
      id: `${i.toString()}-${keyPart}`,
      itemCreatedAt: moment().toISOString(),
      phoneNumber: getRandomPhone(),
      questionReached: isTimeoutItem
        ? getRandomQuestionReached()
        : "Error step",
      reason: isTimeoutItem ? "Timeout" : "Error",
    };

    items.push(newItem);
  }

  return items;
};

const getRandomQuestionReached = () => {
  const num = Math.floor(Math.random() * 4);
  switch (num) {
    case 0:
      return "PickLanguage";
    case 1:
      return "AskIfRefugee";
    case 2:
      return "AskLocation";
    case 3:
      return "AskCallType";
    default:
      return "AskHelpOption";
  }
};

//generates/ returns N fake callback items
export const generateFakeCallBackItems = (
  fromDate: Date,
  untilDate: Date,
  numberItems: number
): CallbackMapItem[] => {
  console.log(
    `Creating Dummy Callback Items made from: ${formatDate(
      fromDate
    )} to ${formatDate(untilDate)}`
  );

  const items: CallbackMapItem[] = [];
  const keyPart = moment().toISOString();
  //create N dummy items
  for (let i = 0; i < numberItems; i++) {
    const isComplaint = Math.floor(Math.random() * 2) === 0;
    const callback = Math.floor(Math.random() * 2) === 0;

    const randomAmountOfDays = Math.floor(Math.random() * 4);
    const randomAmountOfMins = Math.floor(Math.random() * 60) + 1;
    const randomAmountOfSeconds = Math.floor(Math.random() * 60) + 1;
    const randomCreatedAtDate = moment();
    randomCreatedAtDate.subtract(randomAmountOfDays, "days");
    randomCreatedAtDate.subtract(randomAmountOfMins, "minutes");
    randomCreatedAtDate.subtract(randomAmountOfSeconds, "seconds");

    const newItem: CallbackMapItem = {
      itemKey: `${i.toString()}-${keyPart}`,
      createdAt: randomCreatedAtDate.toISOString(),
      completedAt: moment().toISOString(),
      completedBy:
        Math.floor(Math.random() * 2) === 0
          ? "adam_2Emasters"
          : "joe_2Ehainstock",
      phoneNumber: getRandomPhone(),
      attempts: Math.floor(Math.random() * 10) + 1,
      language: getRandomLanguage(),
      location: getRandomLocation(),
      isComplaint: isComplaint,
      callerType: isComplaint
        ? "N/A"
        : Math.floor(Math.random() * 2) === 0
        ? "Refugee"
        : "IDP",
      helpOption: isComplaint ? "N/A" : getRandomHelpOption(),
      priority: getRandomPriority(),
    };

    items.push(newItem);
  }

  return items;
};

const getRandomPhone = () => {
  const getNumber = () => Math.floor(Math.random() * 10);

  return `+${getNumber()}${getNumber()}${getNumber()}${getNumber()}${getNumber()}${getNumber()}${getNumber()}${getNumber()}${getNumber()}${getNumber()}${getNumber()}${getNumber()}`;
};

const getRandomHelpOption = () => {
  const num = Math.floor(Math.random() * 5);
  let option = "";

  switch (num) {
    case 0:
      option = "ID Card";
      break;
    case 1:
      option = "National Number";
      break;
    case 2:
      option = "Birth Certificate";
      break;
    case 3:
      option = "Marriage Certificate";
      break;
    case 4:
      option = "Death Certificate";
      break;
    default:
      option = "";
      break;
  }

  return option;
};

const getRandomLanguage = () => {
  const num = Math.floor(Math.random() * 4);
  let language = "";
  switch (num) {
    case 0:
      language = "English";
      break;
    case 1:
      language = "Arabic";
      break;
    case 2:
      language = "Tigrinya";
      break;
    case 3:
      language = "Amharic";
      break;
    default:
      language = "";
      break;
  }

  return language;
};

const getRandomLocation = () => {
  const num = Math.floor(Math.random() * 2);
  let location = "";
  switch (num) {
    case 0:
      location = "Khartoum";
      break;
    case 1:
      location = "Darfur";
      break;
    default:
      location = "";
      break;
  }

  return location;
};

const getRandomPriority = () => {
  const num = Math.floor(Math.random() * 3);
  let priority = "";
  switch (num) {
    case 0:
      priority = "Low";
      break;
    case 1:
      priority = "Medium";
      break;
    case 2:
      priority = "High";
      break;
    default:
      priority = "";
      break;
  }

  return priority;
};

//generates/ returns N fake calls
export const generateFakeCalls = (
  fromDate: Date,
  untilDate: Date,
  numberItems: number
): CallLeg[] => {
  console.log(
    `Creating ${numberItems} Dummy Calls made from: ${formatDate(
      fromDate
    )} to ${formatDate(untilDate)}`
  );

  const items: CallLeg[] = [];
  const keyPart = moment().toISOString();
  //create N dummy items
  for (let i = 0; i < numberItems; i++) {
    const clientLeg = Math.floor(Math.random() * 2) === 0;
    const callStatus = getRandomCallStatus();
    const duration = getRandomDuration();
    const randomCreatedAtDate = moment();
    randomCreatedAtDate.subtract(duration, "seconds");
    const newItem: CallLeg = {
      callSid: `${i.toString()}-${keyPart}`,
      createdAt: randomCreatedAtDate.toISOString(),
      startedAt: randomCreatedAtDate.toISOString(),
      completedAt: moment().toISOString(),
      to: clientLeg ? "client:agent_2Ename" : getRandomPhone(),
      isAgentLeg: clientLeg,
      duration: callStatus === "completed" ? duration.toString() : "0",
      status: callStatus,
      price: clientLeg
        ? "0"
        : callStatus === "completed"
        ? `-${getPrice(duration)}`
        : "0",
      priceUnit: "USD",
    };

    items.push(newItem);
  }

  return items;
};

const getRandomCallStatus = () => {
  const num = Math.floor(Math.random() * 4);
  let status = "";
  switch (num) {
    case 0:
      status = "completed";
      break;
    case 1:
      status = "completed";
      break;
    case 2:
      status = "failed";
      break;
    case 3:
      status = "cancelled";
      break;

    default:
      status = "";
      break;
  }

  return status;
};

const getRandomDuration = () => {
  const duration = Math.floor(Math.random() * 600);
  return duration;
};

const getPrice = (duration: number) => {
  return (duration * 0.0002).toFixed(2);
};
