import { getData, userShort, userType, message, reacts, notification } from './dataStore';
import crypto from 'crypto';
import { SERVER_URL } from './wrapperFunctions';

export const SECRET = 'dreamBeans';

export function getHashOf(plaintext: string) {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}

export let localRoute: string;
if (process.env.BACKEND_URL !== undefined) {
  localRoute = `http://${process.env.BACKEND_URL}`;
} else {
  localRoute = `${SERVER_URL}`;
}

export const defaultProfilePhoto = localRoute + '/imgurl/defaultPhoto.jpg';

/**
   * <Description: Returns the object in channels array which corresponds with inputed channelId. >
   * @param {number} channelId
   * @returns { channel: { channelId, channelName, isPublic, ownerMembers:
   * [{ uId, email, nameFirst, nameLast, handleStr}],
   * allMembers: [{uId, email, nameFirst, nameLast, handleStr}], messages } }
   */
export function getChannel(channelId: number) {
  const data = getData();
  return data.channels.find(c => c.channelId === channelId);
}

/**
 * <Description: Returns the object in users array which corresponds with inputted uId. >
 * @param {number} uId
 * @returns { user: { authUserId, user_handle, email, password, nameFirst, nameLast }}
 */
export function getUId(uId: number) {
  const data = getData();
  return data.users.find(u => u.authUserId === uId);
}

/**
 * <Description: Returns the object in users array which corresponds with inputted token. >
 * @param {string} token
 * @returns { name, dmId, members, owners, messages, timeJoined? }
 */
export function getToken(token: string) {
  const data = getData();
  return data.users.find(a => a.sessions.includes(token) === true);
}

/**
 * <Description: Returns the object in the dms array which corresponds with inputted dmId. >
 * @param {string} token
 * @returns { user: { authUserId, user_handle, email, password, nameFirst, nameLast }}
 */
export function getDm(dmId: number) {
  const data = getData();
  return data.dms.find(d => d.dmId === dmId);
}

export function userConvert(user: userType): userShort {
  return {
    uId: user.authUserId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.userHandle,
    profileImgUrl: user.profileImgUrl
  };
}

/**
 * <Description: Checks if the messageId is in Dms. >
 * @param {number} messageId - MessageId
 * @returns { number }- either -1 if not in Dms or an index if in Dms
 */

export function CheckValidMessageDms(messageId: number) {
  const data = getData();
  let validMessage = -1;
  for (const m in data.dms) {
    // checks if valid message
    if (data.dms[m].messages.find(message => message.messageId === messageId)) {
      validMessage = parseInt(m);
    }
  }
  return validMessage;
}

/**
 * <Description: Checks if the messageId is in Channels. >
 * @param {number} messageId - messageId
 * @returns { number } - either -1 if not in channels or an index if in channel
 */

export function CheckValidMessageChannels(messageId: number) {
  const data = getData();
  let validMessage = -1;
  for (const m in data.channels) {
    // checks if valid message
    if (data.channels[m].messages.find(message => message.messageId === messageId)) {
      validMessage = parseInt(m);
    }
  }
  return validMessage;
}

/**
 * <Description: Checks if the User is the same user or if they are an owner >
 * @param {number} authUserid - An authenticated user
 * @param {number} messageId - messageId
 * @returns { number }
 */

export function CheckMessageUser(authUserId : number, messageId : number) : boolean {
  const data = getData();
  const CheckInChannel = CheckValidMessageChannels(messageId);
  if (CheckInChannel === -1) {
    const checkInDm = CheckValidMessageDms(messageId);
    if (checkInDm === -1) {
      // not in channel or dms
      return false;
    } else {
      // in dms
      const DmMessageIndex = data.dms[checkInDm].messages.findIndex(message => message.messageId === messageId);
      // checks if the user is the same
      if (data.dms[checkInDm].messages[DmMessageIndex].uId === authUserId) {
        return true;
      } else {
        // if not the same, check if user is owner
        if (data.dms[checkInDm].owners.find(member => member.uId === authUserId)) {
          return true;
        } else {
          return false;
        }
      }
    }
  } else {
    // Message is in channel
    const ChannelMessageIndex = data.channels[CheckInChannel].messages.findIndex(message => message.messageId === messageId);
    // Is the same user
    if (data.channels[CheckInChannel].messages[ChannelMessageIndex].uId === authUserId) {
      return true;
    } else {
    // check if user is member
      for (const member of data.channels[CheckInChannel].ownerMembers) {
        if (member.uId === authUserId) {
          return true;
        }
      }
      return false;
    }
  }
}
/**
 * <Description: Checks if message is already pinned >
 * @param {number} messageId - messageId
 * @returns { Booleon }
 */

export function checkIsPinned(messageId: number) : boolean {
  const data = getData();
  const CheckInChannel = CheckValidMessageChannels(messageId);
  if (CheckInChannel === -1) {
    const checkInDm = CheckValidMessageDms(messageId);
    if (checkInDm === -1) {
      // not in channel or dms
      return false;
    } else {
      // in dms
      const DmMessageIndex = data.dms[checkInDm].messages.findIndex(message => message.messageId === messageId);
      // checks if pinned
      if (data.dms[checkInDm].messages[DmMessageIndex].isPinned === true) {
        return true;
      } else {
        return false;
      }
    }
  } else {
    // Message is in channel
    const ChannelMessageIndex = data.channels[CheckInChannel].messages.findIndex(message => message.messageId === messageId);
    // checks if pinned
    if (data.channels[CheckInChannel].messages[ChannelMessageIndex].isPinned === true) {
      return true;
    } else {
      return false;
    }
  }
}

/**
 * <Description: Checks if message is already unpinned >
 * @param {number} messageId - messageId
 * @returns { Booleon }
 */

export function checkIsUnpinned(messageId: number) : boolean {
  const data = getData();
  const CheckInChannel = CheckValidMessageChannels(messageId);
  if (CheckInChannel === -1) {
    const checkInDm = CheckValidMessageDms(messageId);
    if (checkInDm === -1) {
      // not in channel or dms
      return false;
    } else {
      // in dms
      const DmMessageIndex = data.dms[checkInDm].messages.findIndex(message => message.messageId === messageId);
      // checks if pinned
      if (data.dms[checkInDm].messages[DmMessageIndex].isPinned === false) {
        return false;
      } else {
        return true;
      }
    }
  } else {
    // Message is in channel
    const ChannelMessageIndex = data.channels[CheckInChannel].messages.findIndex(message => message.messageId === messageId);
    // checks if pinned
    if (data.channels[CheckInChannel].messages[ChannelMessageIndex].isPinned === false) {
      return false;
    } else {
      return true;
    }
  }
}

/**
 * @param {number} messageId - unique identifier for a message
 *
 * @returns {message} returns message object that matches the messageId that the user is part of
 */

export function messageFinder (authUserId: number, messageId: number) {
  const data = getData();
  let messageFound: message;

  for (const channel of data.channels) {
    const userInChannel = channel.allMembers.find((a: userShort) => a.uId === authUserId);
    if (userInChannel !== undefined) {
      for (const message of channel.messages) {
        if (message.messageId === messageId) {
          messageFound = message;
          return messageFound;
        }
      }
    }
  }

  for (const dm of data.dms) {
    const userInDm = dm.members.find((a: userShort) => a.uId === authUserId);
    if (userInDm !== undefined) {
      for (const message of dm.messages) {
        if (message.messageId === messageId) {
          messageFound = message;
          return messageFound;
        }
      }
    }
  }

  return false;
}

/**
 * <Description: Returns whether a user is part of dm>
 * @param {number} dmId
 * @param {number} authUserId
 * @returns {boolean}
 */
export function userMemberDM (dmId: number, authUserId: number) {
  const data = getData();

  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      const userInDm = dm.members.find((a: userShort) => a.uId === authUserId);
      if (userInDm !== undefined) {
        return true;
      }
    }
  }
  return false;
}

/**
 * <Description: Returns whether a user is part of channel>
 * @param {number} channelId
 * @param {number} authUserId
 * @returns {Boolean}
 */
export function userMemberChannel (channelId: number, authUserId: number) {
  const data = getData();

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      const userInChannel = channel.allMembers.find((a: userShort) => a.uId === authUserId);
      if (userInChannel !== undefined) {
        return true;
      }
    }
  }
  return false;
}

/**
 * <Description: Function will change the IsthisUserReacted to true>
 * @param channelId
 * @param authUserId
 */
export function hasUserReactedChannel (channelId: number, authUserId: number) {
  const data = getData();

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const message of channel.messages) {
        const react: reacts = message.reacts.find(c => c.uIds.includes(authUserId) === true);
        const reaction: reacts = message.reacts.find((c: reacts) => c.reactId === 1);
        if (react !== undefined) {
          react.isThisUserReacted = true;
          return;
        }
        if (reaction === undefined) {
          return;
        }
        if (react === undefined && reaction !== undefined) {
          reaction.isThisUserReacted = false;
          return;
        }
      }
    }
  }
}

export function hasUserReactedDm (dmId: number, authUserId: number) {
  const data = getData();

  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      for (const message of dm.messages) {
        const react: reacts = message.reacts.find(c => c.uIds.includes(authUserId) === true);
        const reaction: reacts = message.reacts.find((c: reacts) => c.reactId === 1);
        if (react !== undefined) {
          react.isThisUserReacted = true;
          return;
        }
        if (reaction === undefined) {
          return;
        }
        if (react === undefined && reaction !== undefined) {
          reaction.isThisUserReacted = false;
          return;
        }
      }
    }
  }
}

export function messageNotificator(message: string, members: userShort[], isChannel: boolean, id: number, sender: string) {
  const splitString = message.split('@');

  if (splitString.length === 0) {
    return 0;
  }

  splitString.shift();
  const handleArray: string[] = [];
  for (const i in splitString) {
    if (splitString[i].includes(' ')) {
      handleArray[i] = splitString[i].substring(0, splitString[i].indexOf(' '));
    } else {
      handleArray[i] = splitString[i];
    }
  }

  const notifList: userShort[] = [];

  members.forEach(user => {
    if (handleArray.includes(user.handleStr)) notifList.push(user);
  });

  const notifObj: notification = {
    channelId: -1,
    dmId: -1,
    notificationMessage: ''
  };

  let notifString: string;

  if (isChannel === true) {
    const channel = getChannel(id);
    notifObj.channelId = channel.channelId;
    notifString = `${sender} tagged you in ${channel.channelName}: ${message.slice(0, 20)}`;
  } else {
    const dm = getDm(id);
    notifObj.dmId = dm.dmId;
    notifString = `${sender} tagged you in ${dm.name}: ${message.slice(0, 20)}`;
  }

  notifObj.notificationMessage = notifString;

  const data = getData().users;

  data.forEach(user => {
    if (notifList.some(u => u.uId === user.authUserId)) {
      user.notifications.unshift(notifObj);
    }
  });
}
