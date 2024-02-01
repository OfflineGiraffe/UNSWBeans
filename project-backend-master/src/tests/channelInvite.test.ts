import { newUser, newChannel } from '../dataStore';
import { defaultProfilePhoto } from '../helperFunctions';
import {
  requestClear, requestAuthRegister, requestChannelsCreate, requestchannelDetails, requestChannelInvite
} from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe('Channel Invite tests', () => {
  let nicole: newUser;
  let dennis: newUser;
  let geoffrey: newUser;
  let channel: newChannel;

  beforeEach(() => {
    requestClear();
    nicole = requestAuthRegister('nicole.jiang@gmail.com', 'password1', 'nicole', 'jiang');
    dennis = requestAuthRegister('dennis.pulickal@gmail.com', 'password2', 'dennis', 'pulickal');
    geoffrey = requestAuthRegister('geoffrey.mok@gmail.com', 'password3', 'geoffrey', 'mok');
    channel = requestChannelsCreate(nicole.token, 'funChannelName', true);
  });

  test('creator of channel can invite other valid uIds', () => {
    expect(requestChannelInvite(nicole.token, channel.channelId, dennis.authUserId)).toStrictEqual({});
    expect(requestchannelDetails(dennis.token, channel.channelId)).toStrictEqual(
      {
        name: 'funChannelName',
        isPublic: true,
        ownerMembers: [{
          uId: 0,
          email: 'nicole.jiang@gmail.com',
          nameFirst: 'nicole',
          nameLast: 'jiang',
          handleStr: 'nicolejiang',
          profileImgUrl: defaultProfilePhoto
        }],
        allMembers: [{
          uId: 0,
          email: 'nicole.jiang@gmail.com',
          nameFirst: 'nicole',
          nameLast: 'jiang',
          handleStr: 'nicolejiang',
          profileImgUrl: defaultProfilePhoto
        }, {
          uId: 1,
          email: 'dennis.pulickal@gmail.com',
          nameFirst: 'dennis',
          nameLast: 'pulickal',
          handleStr: 'dennispulickal',
          profileImgUrl: defaultProfilePhoto
        }],
      }
    );
  });

  test('invited valid user can invite other valid users', () => {
    requestChannelInvite(nicole.token, channel.channelId, dennis.authUserId);
    expect(requestChannelInvite(dennis.token, channel.channelId, geoffrey.authUserId)).toStrictEqual({});
    expect(requestchannelDetails(geoffrey.token, channel.channelId)).toStrictEqual(
      {
        name: 'funChannelName',
        isPublic: true,
        ownerMembers: [{
          uId: 0,
          email: 'nicole.jiang@gmail.com',
          nameFirst: 'nicole',
          nameLast: 'jiang',
          handleStr: 'nicolejiang',
          profileImgUrl: defaultProfilePhoto
        }],

        allMembers: [{
          uId: 0,
          email: 'nicole.jiang@gmail.com',
          nameFirst: 'nicole',
          nameLast: 'jiang',
          handleStr: 'nicolejiang',
          profileImgUrl: defaultProfilePhoto
        }, {
          uId: 1,
          email: 'dennis.pulickal@gmail.com',
          nameFirst: 'dennis',
          nameLast: 'pulickal',
          handleStr: 'dennispulickal',
          profileImgUrl: defaultProfilePhoto
        }, {
          uId: 2,
          email: 'geoffrey.mok@gmail.com',
          nameFirst: 'geoffrey',
          nameLast: 'mok',
          handleStr: 'geoffreymok',
          profileImgUrl: defaultProfilePhoto
        }],
      }
    );
  });

  test('private channels can also let users become members upon invitation', () => {
    const channelPriv = requestChannelsCreate(nicole.token, 'funChannelName', false);
    expect(requestChannelInvite(nicole.token, channelPriv.channelId, dennis.authUserId)).toStrictEqual({});
    expect(requestchannelDetails(dennis.token, channelPriv.channelId)).toStrictEqual(
      {
        name: 'funChannelName',
        isPublic: false,
        ownerMembers: [{
          uId: 0,
          email: 'nicole.jiang@gmail.com',
          nameFirst: 'nicole',
          nameLast: 'jiang',
          handleStr: 'nicolejiang',
          profileImgUrl: defaultProfilePhoto
        }],
        allMembers: [{
          uId: 0,
          email: 'nicole.jiang@gmail.com',
          nameFirst: 'nicole',
          nameLast: 'jiang',
          handleStr: 'nicolejiang',
          profileImgUrl: defaultProfilePhoto
        }, {
          uId: 1,
          email: 'dennis.pulickal@gmail.com',
          nameFirst: 'dennis',
          nameLast: 'pulickal',
          handleStr: 'dennispulickal',
          profileImgUrl: defaultProfilePhoto
        }],
      }
    );
  });

  test('throw error when channel is invalid', () => {
    expect(requestChannelInvite(nicole.token, 5, dennis.authUserId)).toStrictEqual(400);
  });

  test('throw error when token is invalid', () => {
    expect(requestChannelInvite('a', channel.channelId, dennis.authUserId)).toStrictEqual(403);
  });

  test('throw error when uId is invalid', () => {
    expect(requestChannelInvite(nicole.token, channel.channelId, 70)).toStrictEqual(400);
  });

  test('throw error when uId is already a member', () => {
    requestChannelInvite(nicole.token, channel.channelId, dennis.authUserId);
    expect(requestChannelInvite(nicole.token, channel.channelId, dennis.authUserId)).toStrictEqual(400);
  });

  test('throw error when authUserId is not a member', () => {
    expect(requestChannelInvite(dennis.token, channel.channelId, geoffrey.authUserId)).toStrictEqual(403);
  });

  test('throw error when user tries to invite themself', () => {
    expect(requestChannelInvite(nicole.token, channel.channelId, nicole.authUserId)).toStrictEqual(400);
  });
});
