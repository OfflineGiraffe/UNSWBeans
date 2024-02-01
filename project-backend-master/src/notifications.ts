import HTTPError from 'http-errors';

import { userType, notification } from './dataStore';

import { getToken, getHashOf, SECRET } from './helperFunctions';

export function notificationsGet(token: string): { notifications: notification[] } {
  const tokenHashed = getHashOf(token + SECRET);
  const user: userType = getToken(tokenHashed);

  if (user === undefined) {
    throw HTTPError(403, `Error: User with token '${token}' does not exist!`);
  }

  return { notifications: user.notifications };
}
