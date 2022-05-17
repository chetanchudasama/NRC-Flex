export interface IArgs {
  exportDate?: string;
  outDirectory?: string;
  help?: boolean;
}

export interface Worker {
  workerSid: string;
  name: string;
  email: string;
  contactUri: string;
}

export interface TimeoutMapItem {
  id: string;
  questionReached: string;
  reason: string;
  phoneNumber: string;
  itemCreatedAt: string;
}

export interface CallbackMapItem {
  itemKey: string;
  createdAt: string;
  completedAt: string;
  completedBy: string;
  phoneNumber: string;
  attempts: number;
  language: string;
  location: string;
  isComplaint: boolean;
  callerType: string;
  helpOption: string;
  priority: string;
}

export interface CallLeg {
  callSid: string;
  createdAt: string;
  startedAt: string;
  completedAt: string;
  to: string;
  isAgentLeg: boolean;
  duration: string;
  status: string;
  price: string;
  priceUnit: string;
}
