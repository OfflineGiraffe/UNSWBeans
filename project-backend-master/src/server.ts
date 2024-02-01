import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';

import { readData, saveData, wipeData } from './dataStore';

import { adminUserRemoveV1, adminUserpermissionChangeV1 } from './admin';
import { authRegisterV3, authLoginV3, authLogoutV2, authPasswordResetRequestV1, authPasswordResetResetV1 } from './auth';

import { channelDetailsV3, channelJoinV3, channelInviteV3, channelMessagesV3, channelleaveV2, addOwnerV2, removeOwnerV2 } from './channel';
import { channelsCreateV3, channelsListV3, channelsListAllV3 } from './channels';

import { dmCreateV2, messageSendV2, dmMessagesV2, dmRemoveV2, dmDetailsV2, dmListV2, messageEditV2, messageSendDmV2, dmLeaveV2, messageRemoveV2, messagePinV1, messageReactV1, messageUnreactV1, messageUnpinV1, messageSendLaterV1, messageSendLaterDmV1, messageShareV1 } from './messages';

import { userProfileV3, usersAllV2, userSetNameV2, userSetEmailV2, userSetHandleV2, userStatsV1, userProfileUploadPhotoV1, usersStatsV1 } from './users';

import { searchV1 } from './search';
import { standupStartV1, standupActiveV1, standupSendV1 } from './standup';
import { clearV1 } from './other';
import { notificationsGet } from './notifications';

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));

// Example get request
app.get('/echo', (req: Request, res: Response, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  readData();
  console.log(`⚡️ Server listening on port ${process.env.PORT || config.port}`);
});

app.use('/imgurl', express.static('imgurl'));

app.delete('/clear/v1', (req: Request, res: Response) => {
  wipeData();
  res.json(clearV1());
});

app.post('/auth/login/v3', (req: Request, res: Response, next) => {
  try {
    const { email, password } = req.body;

    const ret = authLoginV3(email, password);
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.post('/auth/register/v3', (req: Request, res: Response, next) => {
  try {
    const { email, password, nameFirst, nameLast } = req.body;

    const ret = authRegisterV3(email, password, nameFirst, nameLast);
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.post('/channels/create/v3', (req: Request, res: Response, next) => {
  try {
    const { name, isPublic } = req.body;
    const token = req.header('token');

    const ret = channelsCreateV3(token, name, isPublic);
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.get('/channels/listall/v3', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');

    return res.json(channelsListAllV3(token));
  } catch (err) {
    next(err);
  }
});

app.get('/user/profile/v3', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const uId = req.query.uId as string;

    return res.json(userProfileV3(token, parseInt(uId)));
  } catch (err) {
    next(err);
  }
});

app.get('/channel/details/v3', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const channelId = req.query.channelId as string;

    return res.json(channelDetailsV3(token, parseInt(channelId)));
  } catch (err) {
    next(err);
  }
});

app.get('/channel/messages/v3', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const channelId = req.query.channelId as string;
    const start = req.query.start as string;

    return res.json(channelMessagesV3(token, parseInt(channelId), parseInt(start)));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/join/v3', (req: Request, res: Response, next) => {
  try {
    const { channelId } = req.body;
    const token = req.header('token');

    const ret = channelJoinV3(token, parseInt(channelId));
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/invite/v3', (req: Request, res: Response, next) => {
  try {
    const { channelId, uId } = req.body;
    const token = req.header('token');

    const ret = channelInviteV3(token, parseInt(channelId), parseInt(uId));
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/removeowner/v2', (req: Request, res: Response, next) => {
  try {
    const { channelId, uId } = req.body;
    const token = req.header('token');

    const ret = removeOwnerV2(token, parseInt(channelId), parseInt(uId));
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/addowner/v2', (req: Request, res: Response, next) => {
  try {
    const { channelId, uId } = req.body;
    const token = req.header('token');

    const ret = addOwnerV2(token, parseInt(channelId), parseInt(uId));
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.get('/channels/list/v3', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');

    return res.json(channelsListV3(token));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/leave/v2', (req: Request, res: Response, next) => {
  try {
    const { channelId } = req.body;
    const token = req.header('token');

    const ret = channelleaveV2(token, channelId);
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.post('/dm/create/v2', (req: Request, res: Response, next) => {
  try {
    const { uIds } = req.body;
    const token = req.header('token');

    const ret = dmCreateV2(token, uIds);
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.post('/message/send/v2', (req: Request, res: Response, next) => {
  try {
    const { channelId, message } = req.body;
    const token = req.header('token');

    const ret = messageSendV2(token, channelId, message);
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.put('/message/edit/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { messageId, message } = req.body;

    return res.json(messageEditV2(token, messageId, message));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/logout/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');

    const ret = authLogoutV2(token);
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.delete('/dm/remove/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const dmId = req.query.dmId as string;

    const ret = dmRemoveV2(token, parseInt(dmId));
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.get('/dm/messages/v2', (req: Request, res: Response, next) => {
  try {
    const dmId = req.query.dmId as string;
    const start = req.query.start as string;
    const token = req.header('token');

    return res.json(dmMessagesV2(token, parseInt(dmId), parseInt(start)));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/details/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const dmId = req.query.dmId as string;

    res.json(dmDetailsV2(token, parseInt(dmId)));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/list/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');

    return res.json(dmListV2(token));
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setname/v2', (req: Request, res: Response, next) => {
  try {
    const { nameFirst, nameLast } = req.body;
    const token = req.header('token');

    saveData();
    return res.json(userSetNameV2(token, nameFirst, nameLast));
  } catch (err) {
    next(err);
  }
});

app.get('/users/all/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');

    return res.json(usersAllV2(token));
  } catch (err) {
    next(err);
  }
});

app.post('/message/senddm/v2', (req: Request, res: Response, next) => {
  try {
    const { dmId, message } = req.body;
    const token = req.header('token');

    const ret = messageSendDmV2(token, parseInt(dmId), message);
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.post('/dm/leave/v2', (req: Request, res: Response, next) => {
  try {
    const { dmId } = req.body;
    const token = req.header('token');

    const ret = dmLeaveV2(token, parseInt(dmId));
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/sethandle/v2', (req: Request, res: Response, next) => {
  try {
    const { handleStr } = req.body;
    const token = req.header('token');

    saveData();
    return res.json(userSetHandleV2(token, handleStr));
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setemail/v2', (req: Request, res: Response, next) => {
  try {
    const { email } = req.body;
    const token = req.header('token');

    saveData();
    return res.json(userSetEmailV2(token, email));
  } catch (err) {
    next(err);
  }
});

app.delete('/message/remove/v2', (req: Request, res: Response, next) => {
  try {
    const messageId = req.query.messageId as string;
    const token = req.header('token');

    const ret = messageRemoveV2(token, parseInt(messageId));
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.post('/message/pin/v1', (req: Request, res: Response, next) => {
  try {
    const { messageId } = req.body;
    const token = req.header('token');

    const ret = messagePinV1(token, parseInt(messageId));
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.get('/search/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const queryStr = req.query.queryStr as string;

    return res.json(searchV1(token, queryStr));
  } catch (err) {
    next(err);
  }
});

app.post('/standup/start/v1', (req: Request, res: Response, next) => {
  try {
    const { channelId, length } = req.body;
    const token = req.header('token');

    const ret = standupStartV1(token, parseInt(channelId), parseInt(length));
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.post('/message/unpin/v1', (req: Request, res: Response, next) => {
  try {
    const { messageId } = req.body;
    const token = req.header('token');

    const ret = messageUnpinV1(token, parseInt(messageId));
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.get('/standup/active/v1', (req: Request, res: Response, next) => {
  try {
    const channelId = req.query.channelId as string;
    const token = req.header('token');

    return res.json(standupActiveV1(token, parseInt(channelId)));
  } catch (err) {
    next(err);
  }
});

app.post('/message/react/v1', (req: Request, res: Response, next) => {
  try {
    const { messageId, reactId } = req.body;
    const token = req.header('token');

    const ret = messageReactV1(token, parseInt(messageId), parseInt(reactId));
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.post('/standup/send/v1', (req: Request, res: Response, next) => {
  try {
    const { channelId, message } = req.body;
    const token = req.header('token');

    const ret = standupSendV1(token, parseInt(channelId), message);
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.get('/user/stats/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');

    saveData();
    return res.json(userStatsV1(token));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/passwordreset/request/v1', (req: Request, res: Response, next) => {
  try {
    const { email } = req.body;

    const ret = authPasswordResetRequestV1(email);
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.delete('/admin/user/remove/v1', (req: Request, res: Response, next) => {
  try {
    const uId = req.query.uId as string;
    const token = req.header('token');

    const ret = adminUserRemoveV1(token, parseInt(uId));
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.post('/message/unreact/v1', (req: Request, res: Response, next) => {
  try {
    const { messageId, reactId } = req.body;
    const token = req.header('token');

    const ret = messageUnreactV1(token, parseInt(messageId), parseInt(reactId));
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.post('/message/share/v1', (req: Request, res: Response, next) => {
  try {
    const { ogMessageId, message, channelId, dmId } = req.body;
    const token = req.header('token');

    const ret = messageShareV1(token, parseInt(ogMessageId), message, parseInt(channelId), parseInt(dmId));
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.post('/message/sendlater/v1', (req: Request, res: Response, next) => {
  try {
    const { channelId, message, timeSent } = req.body;
    const token = req.header('token');

    const ret = messageSendLaterV1(token, parseInt(channelId), message, timeSent);
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.post('/user/profile/uploadphoto/v1', async (req: Request, res: Response, next) => {
  try {
    const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
    const token = req.header('token');

    saveData();
    const ret = await userProfileUploadPhotoV1(token, imgUrl, parseInt(xStart), parseInt(yStart), parseInt(xEnd), parseInt(yEnd));
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.post('/admin/userpermission/change/v1', (req: Request, res: Response, next) => {
  try {
    const { uId, permissionId } = req.body;
    const token = req.header('token');

    saveData();
    return res.json(adminUserpermissionChangeV1(token, parseInt(uId), parseInt(permissionId)));
  } catch (err) {
    next(err);
  }
});

app.post('/message/sendlaterdm/v1', (req: Request, res: Response, next) => {
  try {
    const { dmId, message, timeSent } = req.body;
    const token = req.header('token');
    saveData();
    return res.json(messageSendLaterDmV1(token, parseInt(dmId), message, timeSent));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/passwordreset/reset/v1', (req: Request, res: Response, next) => {
  try {
    const { resetCode, newPassword } = req.body;
    saveData();
    return res.json(authPasswordResetResetV1(resetCode, newPassword));
  } catch (err) {
    next(err);
  }
});

app.get('/notifications/get/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');

    const ret = notificationsGet(token);
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

app.get('/users/stats/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');

    const ret = usersStatsV1(token);
    saveData();
    return res.json(ret);
  } catch (err) {
    next(err);
  }
});

// handles errors nicely
app.use(errorHandler());

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
