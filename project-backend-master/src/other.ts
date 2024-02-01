import { setData, storedData } from './dataStore';

/**
 * <description: Resets the dataStore to its intial state. 'Clearing' away any additional added objects. >
 * @param {} - None
 *
 * @returns {} - None
 */

export function clearV1 () {
  const clearedData: storedData = {
    users: [],
    channels: [],
    dms: [],
    workspaceStats: {
      channelsExist: [{ numChannelsExist: 0, timeStamp: Math.floor(Date.now() / 1000) }],
      dmsExist: [{ numDmsExist: 0, timeStamp: Math.floor(Date.now() / 1000) }],
      messagesExist: [{ numMessagesExist: 0, timeStamp: Math.floor(Date.now() / 1000) }],
      utilizationRate: 0
    }
  };
  setData(clearedData);

  return {};
}
