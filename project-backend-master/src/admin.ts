import HTTPError from 'http-errors';

import { getData, setData } from './dataStore';
import { getToken, getHashOf, SECRET, getUId, userConvert } from './helperFunctions';

/**
 * <Description: Given a valid uId, the user with that uId will be removed as a admin. The authorising user needs to be a global
 * owner, and the target user cannot be the only user with global ownership. >
 * @param {string} token
 * @param {number} uId
 *
 * @returns {{}}
 */

export function adminUserRemoveV1(token: string, uId: number) {
  const targetUser = getUId(uId);

  const tokenHashed = getHashOf(token + SECRET);
  const tokenUser = getToken(tokenHashed);

  const data = getData();

  if (tokenUser === undefined) {
    throw HTTPError(403, 'Error: Invalid Token');
  } else if (targetUser === undefined) {
    throw HTTPError(400, `Erorr: No user with the specified uId: ${uId}.`);
  }

  const userArray = data.users;
  let i = 0;
  let ownerUid: number;
  userArray.forEach(user => {
    if (user.permissions === 1) {
      ownerUid = user.authUserId;
      i++;
    }
  });

  if (i === 1 && ownerUid === uId) {
    throw HTTPError(400, `Erorr: The target user with uId: ${uId} is the only global owner, so they cannot be removed.`);
  } else if (tokenUser.permissions === 2) {
    throw HTTPError(403, 'Erorr: The authorising user is not a global owner, so they cannot perform this action.');
  }

  const targetUserSh = userConvert(targetUser);

  targetUser.email = '';
  targetUser.isRemoved = true;
  targetUser.nameFirst = 'Removed';
  targetUser.nameLast = 'user';
  targetUser.permissions = null;
  targetUser.sessions = [];
  targetUser.userHandle = '';

  const channels = data.channels;

  channels.forEach(channel => {
    if (channel.allMembers.findIndex(user => user.uId === uId) !== -1) {
      const ind = [channel.allMembers.findIndex(user => user.uId === uId), channel.ownerMembers.findIndex(user => user.uId === uId)];
      if (ind[0] !== -1) {
        channel.allMembers.splice(ind[0], 1);
      }
      if (ind[1] !== -1) {
        channel.ownerMembers.splice(ind[1], 1);
      }

      channel.messages.forEach(msg => {
        if (msg.uId === targetUserSh.uId) {
          msg.message = 'Removed user';
        }
      });
    }
  });

  const dms = data.dms;

  dms.forEach(dm => {
    if (dm.members.findIndex(user => user.uId === uId) !== -1) {
      const ind = [dm.members.findIndex(user => user.uId === uId), dm.owners.findIndex(user => user.uId === uId)];
      if (ind[0] !== -1) {
        dm.members.splice(ind[0], 1);
      }
      if (ind[1] !== -1) {
        dm.owners.splice(ind[1], 1);
      }

      dm.messages.forEach(msg => {
        if (msg.uId === targetUserSh.uId) {
          msg.message = 'Removed user';
        }
      });
    }
  });

  setData(data);

  return { };
}

/**
 * <Description: Given a valid uId, the user with that uId will have their permission level changed according to the permissionId
 * The authorising user needs to be a global owner, and the target user cannot be the only user with global ownership. >
 * @param {string} token
 * @param {number} uId
 * @param {number} permissionId
 *
 * @returns {{}}
 */

export function adminUserpermissionChangeV1 (token: string, uId: number, permissionId: number) {
  const targetUser = getUId(uId);

  const tokenHashed = getHashOf(token + SECRET);
  const userToken = getToken(tokenHashed);

  const data = getData();

  // Invalid token
  if (userToken === undefined) {
    throw HTTPError(403, 'Error: Token is invalid');
  }
  // Invalid uId
  if (targetUser === undefined) {
    throw HTTPError(400, 'Error: userId does not exist!');
  }
  // Invalid permissionId
  if (permissionId !== 1 && permissionId !== 2) {
    throw HTTPError(400, 'Error: permissionId is invalid');
  }

  const userArray = data.users;
  let i = 0;
  let ownerUid: number;
  userArray.forEach(user => {
    if (user.permissions === 1) {
      ownerUid = user.authUserId;
      i++;
    }
  });

  if (i === 1 && ownerUid === uId) {
    throw HTTPError(400, `Erorr: The target user with uId: ${uId} is the only global owner, so they cannot be demoted.`);
  } else if (userToken.permissions === 2) {
    throw HTTPError(403, 'Erorr: The authorising user is not a global owner, so they cannot perform this action.');
  }

  // user already has the permissions level of permissionId
  if (targetUser.permissions === permissionId) {
    throw HTTPError(400, 'Error: User already has set permission level');
  }

  targetUser.permissions = permissionId;

  setData(data);

  return {};
}
