import HTTPError from 'http-errors';
import validator from 'validator';
import request from 'sync-request';
import fs from 'fs';
import sharp from 'sharp';

import { getData, setData } from './dataStore';
import { getToken, getHashOf, SECRET, localRoute } from './helperFunctions';

/**
 * <Description: Returns a users profile for a valid uId that is given to check>
 * @param {number} channelId - unique ID for a channel
 * @param {number} authUserId - unique ID for a user
 * @returns {user}
 */

export function userProfileV3 (token : string, uId : number) {
  const data = getData();

  const tokenHashed = getHashOf(token + SECRET);
  const userToken = getToken(tokenHashed);

  if (userToken === undefined) {
    throw HTTPError(403, `Erorr: '${token}' is invalid`);
  }

  if (data.users.find(users => users.authUserId === uId) === undefined) {
    throw HTTPError(400, 'Erorr: uID is not correct!');
  }

  for (const tokenFinder of data.users) {
    if (uId === tokenFinder.authUserId) {
      return {
        user: {
          uId: tokenFinder.authUserId,
          email: tokenFinder.email,
          nameFirst: tokenFinder.nameFirst,
          nameLast: tokenFinder.nameLast,
          handleStr: tokenFinder.userHandle,
          profileImgUrl: tokenFinder.profileImgUrl,
        }
      };
    }
  }
}

/**
 * <Description: Lists all users and their associated details>
 *
 * @param {string} token - session Id for authorised users
 *
 * @returns {Array of objects}
 */

export function usersAllV2 (token: string) {
  const data = getData();
  const tokenHashed = getHashOf(token + SECRET);
  const user = getToken(tokenHashed);

  if (user === undefined) {
    throw HTTPError(403, `Error: the inputted token '${token}' is invalid`);
  }
  const userArray = data.users;
  const detailsArray = userArray.map(user => {
    if (user.isRemoved === false) {
      return {
        uId: user.authUserId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.userHandle,
        profileImgUrl: user.profileImgUrl
      };
    } else {
      return user;
    }
  });

  return {
    users: detailsArray,
  };
}

/**
 * < Description: Update the authorised user's first and last name.>
 * @param {string} token
 * @param {string} nameFirst
 * @param {string} nameLast
 * @returns {{}}
 */

export function userSetNameV2 (token: string, nameFirst: string, nameLast: string) {
  const tokenHashed = getHashOf(token + SECRET);
  const user = getToken(tokenHashed);

  // error checking
  if (nameFirst === '' || nameFirst.length > 50) {
    throw HTTPError(400, 'Error: First name is not of the correct length');
  } else if (nameLast === '' || nameLast.length > 50) {
    throw HTTPError(400, 'Error: Last name is not of the correct length');
  } else if (user === undefined) {
    throw HTTPError(403, 'Error: Invalid token');
  }

  user.nameFirst = nameFirst;
  user.nameLast = nameLast;

  return {};
}

/**
 * <Description: Update the authorised user's email address.>
 * @param {string} token
 * @param {string} email
 * @returns {{}}
 */
export function userSetEmailV2 (token: string, email: string) {
  const data = getData();
  const tokenHashed = getHashOf(token + SECRET);
  const user = getToken(tokenHashed);

  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'Error: Invalid email');
  } else if (user === undefined) {
    throw HTTPError(403, 'Error: Invalid token');
  } else if (data.users.find(users => users.email === email)) {
    throw HTTPError(400, 'Error: Email already exists');
  }

  user.email = email;

  return {};
}

/**
 * <Description: Update the authorised user's handle (ie. display name).>
 * @param {string} token
 * @param {string} handleStr
 * @returns {{}}
 */
export function userSetHandleV2 (token: string, handleStr: string) {
  const data = getData();

  const tokenHashed = getHashOf(token + SECRET);
  const user = getToken(tokenHashed);

  // error checking
  if (handleStr.length < 3 || handleStr.length > 20) {
    throw HTTPError(400, 'Error: Handle is the incorrect length');
  } else if (handleStr.match(/^[0-9A-Za-z]+$/) === null) {
    throw HTTPError(400, 'Error: Handle contains non-alphanumeric characters');
  } else if (data.users.find(users => users.userHandle === handleStr)) {
    throw HTTPError(400, 'Error: Handle already exists');
  } else if (user === undefined) {
    throw HTTPError(403, 'Error: Invalid token');
  }

  user.userHandle = handleStr;

  return {};
}

/**
 * <Description: Gets the users stats on UNSW Beans.>
 * @param {string} token - A unique token string
 * @returns {}
 */

export function userStatsV1(token: string) {
  const data = getData();
  const tokenHashed = getHashOf(token + SECRET);
  const userToken = getToken(tokenHashed);

  if (userToken === undefined) {
    throw HTTPError(403, 'Error: token is not valid');
  }

  const numChannelsJoined = data.users[userToken.authUserId].stats[3].numChannelsJoined;
  const numDmsJoined = data.users[userToken.authUserId].stats[3].numDmsJoined;
  const numMsgsSent = data.users[userToken.authUserId].stats[3].numMessagesSent;
  const numChannels = data.channels.length;
  const numDms = data.dms.length;
  let numMsgs = 0;

  for (const i in data.channels) {
    numMsgs += data.channels[i].messages.length;
  }

  for (const i in data.dms) {
    numMsgs += data.dms[i].messages.length;
  }

  let involvementRate = (numChannelsJoined + numDmsJoined + numMsgsSent) / (numChannels + numDms + numMsgs);

  if (involvementRate < 0) {
    involvementRate = 0;
  } else if (involvementRate > 1) {
    involvementRate = 1;
  }

  setData(data);

  return {
    userStats: {
      channelsJoined: data.users[userToken.authUserId].stats[0].channelsJoined,
      dmsJoined: data.users[userToken.authUserId].stats[1].dmsJoined,
      messagesSent: data.users[userToken.authUserId].stats[2].messagesSent,
      involvementRate: involvementRate,
    }
  };
}

/**
 * <Description: Given a valid http url of a image, and the coordinates to crop the image, the cropped image is set as the user's
 * profile photo>
 * @param {string} token
 * @param {string} imgUrl
 * @param {number} xStart
 * @param {number} yStart
 * @param {number} xEnd
 * @param {number} xStart
 *
 * @returns {{}}
 */

export async function userProfileUploadPhotoV1(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  const tokenHashed = getHashOf(token + SECRET);
  const user = getToken(tokenHashed);

  if (user === undefined) {
    throw HTTPError(403, 'Error: The token used is not valid.');
  }

  const res = request(
    'GET', imgUrl
  );

  if (res.statusCode !== 200) {
    throw HTTPError(400, 'Error: Image URL is invalid');
  }
  const body = res.getBody();
  const filePath = 'imgurl/temp';
  fs.writeFileSync(filePath, body, { flag: 'w' });

  const image = sharp(filePath);
  const metadata = await image.metadata();

  if (metadata.format !== 'jpeg') { // This is good
    throw HTTPError(400, 'Error: The file is not of type .jpeg/jpg.');
  }

  if ((xStart < 0 || xStart > metadata.width) || (xEnd < 0 || xEnd > metadata.width) ||
    (yStart < 0 || yStart > metadata.height) || (yEnd < 0 || yEnd > metadata.height)) {
    throw HTTPError(400, 'Error: One of the input points are outside the valid limits for the given image.');
  }

  if (xEnd <= xStart || yEnd <= yStart) {
    throw HTTPError(400, 'Error: One of the input end points are less than or equal to their respective start points.');
  }

  // Extracting region (Cropping the image)

  const croppedImg = image.extract({ left: xStart, top: yStart, width: (xEnd - xStart), height: (yEnd - yStart) });
  const uniqueUrl = Math.random().toString(36).substring(2, 10);
  const outputPath = 'imgurl/' + `${uniqueUrl}` + '.jpg';
  croppedImg.toFile(outputPath);

  user.profileImgUrl = localRoute + '/' + outputPath;

  return {};
}

export function usersStatsV1(token: string) {
  const data = getData();
  const tokenHashed = getHashOf(token + SECRET);
  const userToken = getToken(tokenHashed);

  if (userToken === undefined) {
    throw HTTPError(403, 'Error: token is not valid');
  }

  let numUsersWhoHaveJoinedAtLeastOneChannelOrDm = 0;
  data.users.forEach(user => {
    const chLast = user.stats[0].channelsJoined.length - 1;
    const dmLast = user.stats[1].dmsJoined.length - 1;
    if ((user.stats[0].channelsJoined[chLast].numChannelsJoined > 0 || user.stats[1].dmsJoined[dmLast].numDmsJoined > 0) &&
      (user.isRemoved === false)) {
      numUsersWhoHaveJoinedAtLeastOneChannelOrDm++;
    }
  });

  const numUsers = data.users.length;
  const utilisationRate = numUsersWhoHaveJoinedAtLeastOneChannelOrDm / numUsers;

  data.workspaceStats.utilizationRate = utilisationRate;

  return { workspaceStats: data.workspaceStats };
}
