import HTTPError from 'http-errors';

import { getData, setData, channelType, userShort, message, notification } from './dataStore';
import { getChannel, getUId, getToken, getHashOf, SECRET, hasUserReactedChannel } from './helperFunctions';

/**
 * <Description: function gives the channel details for a existing channel>
 * @param {number} channelId - unique ID for a channel
 * @param {string} token - unique sesssion token for a user
 * @returns {name: name, isPublic: isPublic, ownerMembers:
 * [{ uId, email, nameFirst, nameLast, handleStr}],
 * allMembers: [{uId, email, nameFirst, nameLast, handleStr}]}
 */

export function channelDetailsV3(token : string, channelId : number) {
  const data = getData();
  let checkInChannel = false;

  const tokenHashed = getHashOf(token + SECRET);
  const userToken = getToken(tokenHashed);

  // checks if token is valid
  if (userToken === undefined) {
    throw HTTPError(403, `Error: User with token '${token}' does not exist!`);
  }

  // checks if channel is valid and if user is in channel
  if (getChannel(channelId) === undefined) {
    throw HTTPError(400, 'Error: Channel Doesnt Exist!');
  } else {
    if (data.channels[channelId].allMembers.find(user => user.uId === userToken.authUserId)) {
      checkInChannel = true;
    }
  }

  if (checkInChannel === false) {
    throw HTTPError(403, 'Error: User is not in the channel requested!');
  }

  const ownerArraywithoutTimejoined = [];
  const AllArraywithoutTimejoined = [];

  for (const j in data.channels[channelId].ownerMembers) {
    ownerArraywithoutTimejoined.push(
      {
        uId: data.channels[channelId].ownerMembers[j].uId,
        email: data.channels[channelId].ownerMembers[j].email,
        nameFirst: data.channels[channelId].ownerMembers[j].nameFirst,
        nameLast: data.channels[channelId].ownerMembers[j].nameLast,
        handleStr: data.channels[channelId].ownerMembers[j].handleStr,
        profileImgUrl: data.channels[channelId].ownerMembers[j].profileImgUrl
      }
    );
  }

  for (const k in data.channels[channelId].allMembers) {
    AllArraywithoutTimejoined.push(
      {
        uId: data.channels[channelId].allMembers[k].uId,
        email: data.channels[channelId].allMembers[k].email,
        nameFirst: data.channels[channelId].allMembers[k].nameFirst,
        nameLast: data.channels[channelId].allMembers[k].nameLast,
        handleStr: data.channels[channelId].allMembers[k].handleStr,
        profileImgUrl: data.channels[channelId].allMembers[k].profileImgUrl
      }
    );
  }

  return {
    name: data.channels[channelId].channelName,
    isPublic: data.channels[channelId].isPublic,
    ownerMembers: ownerArraywithoutTimejoined,
    allMembers: AllArraywithoutTimejoined,
  };
}

/**
 * <Description: function adds authorised user into a channel they can join>
 * @param {number} channelId - unique ID for a channel
 * @param {number} authUserId - unique ID for a user
 * @returns does not return anything
 */

export function channelJoinV3 (token: string, channelId: number) {
  const data = getData();

  const tokenHashed = getHashOf(token + SECRET);
  const user = getToken(tokenHashed);

  const channel = getChannel(channelId);

  if (!channel) {
    throw HTTPError(400, `Error: '${channelId}' does not refer to a valid channel`);
  }

  if (user === undefined) {
    throw HTTPError(403, `Erorr: '${token}' is invalid`);
  }

  if (channel.allMembers.find(a => a.uId === user.authUserId)) {
    throw HTTPError(400, `Error: '${token}' is already a member of the channel`);
  }

  if (channel.isPublic === false && user.permissions !== 1) { // users with perm 1 are global owners
    throw HTTPError(403, `Error: '${channelId}' is private, you cannot join this channel`);
  }

  channel.allMembers.push({ email: user.email, handleStr: user.userHandle, nameFirst: user.nameFirst, nameLast: user.nameLast, uId: user.authUserId, profileImgUrl: user.profileImgUrl });

  // adds 1 to number of channels joined
  data.users[user.authUserId].stats[3].numChannelsJoined += 1;

  // pushes some stats back to the user
  data.users[user.authUserId].stats[0].channelsJoined.push({
    numChannelsJoined: data.users[user.authUserId].stats[3].numChannelsJoined,
    timeStamp: Math.floor(Date.now() / 1000)
  });

  setData(data);

  return {};
}

/**
 * <Description: Invites a user with ID uId to join channel with ID channelID.
 * Once invited, the user is added to the channel immediately. In both public
 * and private channels, all members are able to invite users.

 * @param {string} token
 * @param {number} channelId
 * @param {number} uId
 * @returns
 */

export function channelInviteV3 (token: string, channelId: number, uId: number) {
  const data = getData();
  const userArray = data.users;
  const channelArray = data.channels;

  const channel = getChannel(channelId);
  const user = getUId(uId);

  const tokenHashed = getHashOf(token + SECRET);
  const authUserToken = getToken(tokenHashed);

  // checking for invalid channelId, invalid uId, invalid token
  if (channel === undefined) {
    throw HTTPError(400, 'Error: Invalid channelId');
  }

  if (user === undefined) {
    throw HTTPError(400, 'Error: Invalid uId');
  }

  if (authUserToken === undefined) {
    throw HTTPError(403, 'Error: Invalid token');
  }

  // find which index the channel is in
  let i = 0;
  for (const num1 in channelArray) {
    if (channelArray[num1].channelId === channelId) {
      i = parseInt(num1); // channelId in loops below would be replaced by i;
    }
  }

  // error - uId is already part of the channel
  const allMembersArray = channelArray[i].allMembers;
  for (const num2 in allMembersArray) {
    if (allMembersArray[num2].uId === uId) {
      throw HTTPError(400, 'Error: uId is already a part of the channel');
    }
  }

  // error - if the authuser is not a member of the channel, figure out what token really is, what the helper function getToken returns etc.
  const userInChannel = channel.allMembers.find(a => a.uId === authUserToken.authUserId);
  if (userInChannel === undefined) {
    throw HTTPError(403, 'Error: Authorised user is not a member of the channel');
  }

  // no errors, pushing user object to channel
  let j = 0;
  for (const num3 in userArray) {
    if (userArray[num3].authUserId === uId) {
      j = parseInt(num3);
    }
  }
  const userData: userShort = {
    uId: userArray[j].authUserId,
    email: userArray[j].email,
    nameFirst: userArray[j].nameFirst,
    nameLast: userArray[j].nameLast,
    handleStr: userArray[j].userHandle,
    profileImgUrl: userArray[j].profileImgUrl,
  };
  data.channels[channelId].allMembers.push(userData);

  const notifObj: notification = {
    channelId: channelId,
    dmId: -1,
    notificationMessage: `${authUserToken.userHandle} added you to ${channel.channelName}`
  };

  user.notifications.unshift(notifObj);

  // adds 1 to the number of channels joined
  data.users[user.authUserId].stats[3].numChannelsJoined += 1;

  // pushes some stats back to the user
  data.users[j].stats[0].channelsJoined.push({
    numChannelsJoined: data.users[j].stats[3].numChannelsJoined,
    timeStamp: Math.floor(Date.now() / 1000)
  });

  return {};
}

/**
 * <Description: Returns the first 50 messages from a specified channel, given a starting index and given that the accessing user is a member of said channel.
 * If there are less than (start + 50) messages the 'end' value will be -1, to show that there are no more messages to show.

 * @param {string} token
 * @param {number} channelId
 * @param {number} start
 * @returns { messages: [{ messageId, uId, message, timeSent }], start: number, end: number}
 */

export function channelMessagesV3 (token: string, channelId: number, start: number): { messages: message[], start: number, end: number} | { error: string} {
  const tokenHashed = getHashOf(token + SECRET);
  const userToken = getToken(tokenHashed);

  const channel: channelType = getChannel(channelId);

  if (channel === undefined) {
    // If channel is undefined
    throw HTTPError(400, `Error: Channel with channelId '${channel}' does not exist!`);
  } else if (start > channel.messages.length) {
    // If the provided start is greater than the total messages in the channel, an error will be returned
    throw HTTPError(400, `Error: Start '${start}' is greater than the total number of messages in the specified channel`);
  }

  if (userToken === undefined) {
    // If user doesn't exist at all, return an error
    throw HTTPError(403, `Error: User with token '${token}' does not exist!`);
  }

  const userInChannel = channel.allMembers.find((a: userShort) => a.uId === userToken.authUserId);
  if (userInChannel === undefined) {
    // If user is not a member of the target channel, return an error
    throw HTTPError(403, `Error: User with authUserId '${userToken.authUserId}' is not a member of channel with channelId '${channel}'!`);
  }

  hasUserReactedChannel(channelId, userToken.authUserId);

  if ((start + 50) > channel.messages.length) {
    // If the end value is more than the messages in the channel, set end to -1, to indicate no more messages can be loaded
    return {
      messages: channel.messages.slice(0, channel.messages.length),
      start: start,
      end: -1,
    };
  } else {
    return {
      // If the end value is less than the messages in the channel, set end to (start + 50) to indicate there are still more messages to be loaded
      messages: channel.messages.slice(0, (start + 50)),
      start: start,
      end: (start + 50),
    };
  }
}

/**
 * <Description: Make user with user id uId an owner of the channel.>
 * @param {string} token
 * @param {number} channelId
 * @param {number} uId
 * @returns {{}}
 */
export function addOwnerV2 (token: string, channelId: number, uId: number) {
  const data = getData();
  const channel = getChannel(channelId);
  const user = getUId(uId);

  const tokenHashed = getHashOf(token + SECRET);
  const authUserToken = getToken(tokenHashed);

  // ERROR CASES
  // checking for invalid channelId, invalid uId, invalid token
  if (channel === undefined) {
    throw HTTPError(400, 'Error: Invalid channel');
  }

  if (user === undefined) {
    throw HTTPError(400, 'Error: Invalid uId');
  }

  if (authUserToken === undefined) {
    throw HTTPError(403, 'Error: Invalid token');
  }

  // uId refers to a user who is not a member of the channel
  const channelIndex = data.channels.findIndex(c => c.channelId === channelId);
  if (!data.channels[channelIndex].allMembers.find(x => x.uId === uId)) {
    throw HTTPError(400, 'Error: uId is not an member of the channel');
  }

  // uId refers to a user who is already an owner of the channel
  if (data.channels[channelIndex].ownerMembers.find(x => x.uId === uId)) {
    throw HTTPError(400, 'Error: uId is already an owner of the channel');
  }

  // authorised user does not have owner permissions in the channel
  const userIsOwner = data.channels[channelIndex].ownerMembers.find(x => x.uId === authUserToken.authUserId);
  if (userIsOwner === undefined && authUserToken.permissions !== 1) {
    throw HTTPError(403, 'Authorised user does not have owner permissions in the channel');
  }

  // SUCCESS CASE - add user an owner of the channel
  // finding the right index uid belongs to in user array
  const userArray = data.users;
  let index;
  for (const num in userArray) {
    if (userArray[num].authUserId === uId) {
      index = num;
    }
  }

  // initialising keys specific to uid
  const userData = {
    uId: userArray[index].authUserId,
    email: userArray[index].email,
    nameFirst: userArray[index].nameFirst,
    nameLast: userArray[index].nameLast,
    handleStr: userArray[index].userHandle,
    profileImgUrl: userArray[index].profileImgUrl
  };

  // push the data
  data.channels[channelIndex].ownerMembers.push(userData);

  return {};
}

/**
 * <Description: Remove user with user id uId as an owner of the channel.>
 *
 * @param {string} token
 * @param {number} channelId
 * @param {number} uId
 * @returns {{}}
 */

export function removeOwnerV2 (token: string, channelId: number, uId: number) {
  const data = getData();
  const channel = getChannel(channelId);
  const user = getUId(uId);

  const tokenHashed = getHashOf(token + SECRET);
  const authUserToken = getToken(tokenHashed);

  // ERROR CASES
  // checking for invalid channelId, invalid uId, invalid token
  if (channel === undefined) {
    throw HTTPError(400, 'Error: Invalid channel');
  }

  if (user === undefined) {
    throw HTTPError(400, 'Error: Invalid uId');
  }

  if (authUserToken === undefined) {
    throw HTTPError(403, 'Error: Invalid token');
  }

  // uid is not an owner of the channel
  const channelIndex = data.channels.findIndex(c => c.channelId === channelId);

  if (!data.channels[channelIndex].ownerMembers.find(x => x.uId === uId)) {
    throw HTTPError(400, 'Error: uId is not an owner of the channel');
  }

  // uid is the only owner of the channel
  const userIndex = data.channels[channelIndex].ownerMembers.findIndex(x => x.uId === uId);
  if (userIndex === 0) {
    throw HTTPError(400, 'Error: uId is the only owner of the channel');
  }

  // authUser which the token belongs to, is not an owner
  const userIsOwner = data.channels[channelIndex].ownerMembers.find(x => x.uId === authUserToken.authUserId);
  if (userIsOwner === undefined && authUserToken.permissions !== 1) {
    throw HTTPError(403, 'Error: Authorised user is not an owner of channel');
  }

  // SUCCESS CASE
  // remove uid from ownerMembers array
  data.channels[channelIndex].ownerMembers.splice(userIndex, 1);

  return {};
}

/**
 * <Description: Removes a user from a channel.>
 *
 * @param {string} token
 * @param {number} channelId
 * @returns {{}}
 */

export function channelleaveV2(token : string, channelId : number) {
  const data = getData();

  let checkChannelId = false;
  let checkInChannel = false;

  const tokenHashed = getHashOf(token + SECRET);
  const userToken = getToken(tokenHashed);

  // Checks if token is valid
  if (userToken === undefined) {
    throw HTTPError(403, 'Error: The token is undefined');
  }

  // Checks if valid channelId and if the user is in the channel
  if (data.channels.find(channels => channels.channelId === channelId)) {
    checkChannelId = true;

    if (data.channels[channelId].allMembers.find(user => user.uId === userToken.authUserId)) {
      checkInChannel = true;
    }
  }
  // If not in channel or channel isnt real, return error. Else, remove the member from channel.
  if (checkChannelId === false) {
    throw HTTPError(400, 'Error: Channel doesnt exist!');
  }

  if (checkInChannel === false) {
    throw HTTPError(403, 'Error: User is not in the requested channel!');
  }

  if (data.channels[channelId].standup.status === true && data.channels[channelId].standup.starter === userToken.authUserId) {
    throw HTTPError(400, 'Error: User currently started a standup.!');
  }

  data.channels[channelId].ownerMembers = data.channels[channelId].ownerMembers.filter(member => member.uId !== userToken.authUserId);
  data.channels[channelId].allMembers = data.channels[channelId].allMembers.filter(member => member.uId !== userToken.authUserId);

  // minuses 1 to the number of messages sent
  data.users[userToken.authUserId].stats[3].numChannelsJoined -= 1;

  // pushes some stats about number of messages sent back to user
  data.users[userToken.authUserId].stats[0].channelsJoined.push({
    numChannelsJoined: data.users[userToken.authUserId].stats[3].numChannelsJoined,
    timeStamp: Math.floor(Date.now() / 1000)
  });

  // set data and return nothing
  setData(data);

  return {};
}
