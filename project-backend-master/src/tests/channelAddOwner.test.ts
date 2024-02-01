import { newUser, newChannel } from '../dataStore';
import { defaultProfilePhoto } from '../helperFunctions';
import {
  requestClear, requestAuthRegister, requestChannelsCreate, requestchannelDetails, requestChannelJoin, requestAddOwner
} from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe('addOwner tests', () => {
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

  // success case
  test('successfully added owner', () => {
    requestChannelJoin(dennis.token, channel.channelId);
    expect(requestAddOwner(nicole.token, channel.channelId, dennis.authUserId)).toStrictEqual({});
    expect(requestchannelDetails(nicole.token, channel.channelId)).toStrictEqual(
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
        }, {
          uId: 1,
          email: 'dennis.pulickal@gmail.com',
          nameFirst: 'dennis',
          nameLast: 'pulickal',
          handleStr: 'dennispulickal',
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

  // channelId does not refer to a valid channel
  test('throw error if invalid channelId', () => {
    requestChannelJoin(dennis.token, channel.channelId);
    expect(requestAddOwner(nicole.token, 100000, dennis.authUserId)).toStrictEqual(400);
  });

  // uId does not refer to a valid user
  test('throw error if invalid uId', () => {
    requestChannelJoin(dennis.token, channel.channelId);
    expect(requestAddOwner(nicole.token, channel.channelId, 100000)).toStrictEqual(400);
  });

  // uId refers to a user who is not a member of the channel
  test('throw error if uId is not a member of the channel', () => {
    expect(requestAddOwner(nicole.token, channel.channelId, dennis.authUserId)).toStrictEqual(400);
  });

  // uId refers to a user who is already an owner of the channel
  test('throw error if uId is already an owner', () => {
    requestChannelJoin(dennis.token, channel.channelId);
    expect(requestAddOwner(nicole.token, channel.channelId, dennis.authUserId)).toStrictEqual({});
    expect(requestAddOwner(nicole.token, channel.channelId, dennis.authUserId)).toStrictEqual(400);
  });

  // channelId is valid and the authorised user does not have owner permissions
  test('throw error if authorised user is not an owner', () => {
    requestChannelJoin(dennis.token, channel.channelId);
    requestChannelJoin(geoffrey.token, channel.channelId);
    expect(requestAddOwner(geoffrey.token, channel.channelId, dennis.authUserId)).toStrictEqual(403);
  });

  // token is invalid
  test('throw error if token is invalid', () => {
    requestChannelJoin(dennis.token, channel.channelId);
    expect(requestAddOwner('a', channel.channelId, dennis.authUserId)).toStrictEqual(403);
  });

  // authorised user tries to add themselves as an owner
  test('throw error if authorised user adds themself as owner', () => {
    expect(requestAddOwner(nicole.token, channel.channelId, nicole.authUserId)).toStrictEqual(400);
  });
});
