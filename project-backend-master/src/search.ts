import HTTPError from 'http-errors';
import { messagesReacts, userShort } from './dataStore';
import { getData } from './dataStore';
import { getToken, getHashOf, SECRET, hasUserReactedChannel, hasUserReactedDm } from './helperFunctions';

/**
 * < description: Given a string this function searchs all dms and channels that the user is a part
 * of and returns messages that include the query string.
 * @param {string} token - unique token of an authorised user
 * @param {string} queryStr - string entered by user to search
 * @returns {messages: message[]} Array of messages that contain the substring queryStr
 */
export function searchV1(token: string, queryStr: string): { messages: messagesReacts[] } {
  const data = getData();
  const tokenHashed = getHashOf(token + SECRET);
  const user = getToken(tokenHashed);

  if (user === undefined) {
    throw HTTPError(403, `Error: User with token '${token}' does not exist!`);
  }

  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw HTTPError(400, 'Error: Invalid query string');
  }
  // Temporary array to push the messages into
  const temp = [];
  // loop through channels
  for (const channel of data.channels) {
    const userInChannel = channel.allMembers.find((a: userShort) => a.uId === user.authUserId);
    if (userInChannel === undefined) {
      // If user is not a member of the channel then continue
      continue;
    }
    for (const messages of channel.messages) {
      if (messages.message.includes(queryStr)) {
        hasUserReactedChannel(channel.channelId, user.authUserId);
        temp.push(messages);
      }
    }
  }

  // loop through dms
  for (const dm of data.dms) {
    const userInDm = dm.members.find((a: userShort) => a.uId === user.authUserId);
    if (userInDm === undefined) {
      // If user is not a member of the dm then continue
      continue;
    }
    for (const messages of dm.messages) {
      if (messages.message.includes(queryStr)) {
        hasUserReactedDm(dm.dmId, user.authUserId);
        temp.push(messages);
      }
    }
  }

  return {
    messages: temp
  };
}
