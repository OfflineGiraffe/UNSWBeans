import HTTPError from 'http-errors';

import { getData, setData, channelType, channelShort } from './dataStore';
import { getToken, getHashOf, SECRET } from './helperFunctions';

/**
 * <description: Creates a new channel with the specified name and public/private status, the user who makes the channel is added as a owner and member. >
 * @param {string} token - unique ID of the user
 * @param {string} name - Name of the channel to be created
 * @param {boolean} isPublic - To determine whether the channel will be public (true) or private (false)
 *
 * @returns { {channelId: number} } - The channelId of the newly created channel
 */

export function channelsCreateV3 (token: string, name: string, isPublic: boolean): { channelId: number } | { error: string } {
  const data = getData();

  const tokenHashed = getHashOf(token + SECRET);
  const user = getToken(tokenHashed);

  if (user === undefined) {
    throw HTTPError(403, `Error: User with token '${token}' does not exist!`);
  }

  if (name.length >= 1 && name.length <= 20) {
    // const channelID = Math.floor(Math.random() * 10000); a random number generator
    const channelID = data.channels.length;
    // increment counter until a new unique channel number is created

    const channel: channelType = {
      channelId: channelID,
      channelName: name,
      isPublic: isPublic,
      ownerMembers: [
        {
          uId: user.authUserId,
          email: user.email,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          handleStr: user.userHandle,
          profileImgUrl: user.profileImgUrl
        },
      ],
      allMembers: [
        {
          uId: user.authUserId,
          email: user.email,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          handleStr: user.userHandle,
          profileImgUrl: user.profileImgUrl
        },
      ],
      messages: [],
      standup: { status: null, timeFinish: null, starter: null, messageStore: [] },
    };

    data.channels.push(channel);

    // adds 1 to number of channels joined
    data.users[user.authUserId].stats[3].numChannelsJoined++;

    // pushes some stats back to the user
    data.users[user.authUserId].stats[0].channelsJoined.push({
      numChannelsJoined: data.users[user.authUserId].stats[3].numChannelsJoined,
      timeStamp: Math.floor(Date.now() / 1000)
    });

    const last = data.workspaceStats.channelsExist.length - 1;
    const count = data.workspaceStats.channelsExist[last].numChannelsExist;
    data.workspaceStats.channelsExist.push({
      numChannelsExist: (count + 1),
      timeStamp: Math.floor(Date.now() / 1000)
    });

    setData(data);

    return { channelId: channelID };
  } else {
    throw HTTPError(400, 'Error: Channel name does not meet the required stadards.');
  }
}

/**
 * <description: function provides a list of all channels the authorised user is part of>
 * @param {number} authUserId - unique ID of the user
 * @returns {Array of objects} - Consists of channelId and channel names that will be listed
 */

export function channelsListV3 (token: string): {channels: channelShort[]} | {error: string} {
  const data = getData();

  const tokenHashed = getHashOf(token + SECRET);
  const user = getToken(tokenHashed);

  if (user === undefined) {
    throw HTTPError(403, `${token} is invalid`);
  }

  const listChannels = [];

  for (const channel of data.channels) {
    if (channel.allMembers.find(a => a.uId === user.authUserId) || channel.ownerMembers.find(a => a.uId === user.authUserId)) {
      listChannels.push(
        {
          channelId: channel.channelId,
          name: channel.channelName,
        }
      );
    }
  }
  return {
    channels: listChannels,
  };
}

/**
 * <Function Description: Takes in a valid authUserId and lists all the created channels (both Public and Private channels)>
 *
 * @param {number} authUserId - It is the id of the user
 *
 * @returns {Array<Objects>} channels - Lists all of the created channels with their ChannelId and name as keys in the object.
 */

export function channelsListAllV3(token: string): {channels: channelShort[]} | {error: string} {
  const data = getData();
  // Helper function

  const tokenHashed = getHashOf(token + SECRET);
  const user = getToken(tokenHashed);

  if (user === undefined) {
    throw HTTPError(403, `Error: User with token '${token}' does not exist!`);
  }

  // temporary array for channels
  const tempChannels = [];

  for (const channel of data.channels) {
    tempChannels.push(
      {
        channelId: channel.channelId,
        name: channel.channelName,
      }
    );
  }
  return {
    channels: tempChannels,
  };
}
