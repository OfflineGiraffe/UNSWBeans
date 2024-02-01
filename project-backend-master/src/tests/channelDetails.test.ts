import { newUser, newChannel } from '../dataStore';
import { defaultProfilePhoto } from '../helperFunctions';
import {
  requestClear, requestAuthRegister, requestChannelsCreate, requestchannelDetails, requestChannelJoin
} from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe('Channel details testing', () => {
  let user1: newUser;
  let user2: newUser;
  let user3: newUser;
  let channel1: newChannel;
  let channel2: newChannel;
  let channel3: newChannel;

  beforeEach(() => {
    requestClear();

    user1 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'nicole', 'Doe');
    channel1 = requestChannelsCreate(user1.token, 'Channel1', true);

    user2 = requestAuthRegister('example2@gmail.com', 'ABCD1234', 'Bob', 'Doe');
    channel2 = requestChannelsCreate(user2.token, 'Channel2', true);

    channel3 = requestChannelsCreate(user1.token, 'Channel3', true);

    user3 = requestAuthRegister('example3@gmail.com', 'ABCD1234', 'Bob', 'Doe');
  });

  test('Error testing', () => {
    // Channel ID is invalid
    expect(requestchannelDetails(user1.token, 4)).toStrictEqual(400);

    // authUserID is invalid
    expect(requestchannelDetails('Randomtoken', channel1.channelId)).toStrictEqual(403);

    // Channel ID is valid but authUserID is not in the channel
    expect(requestchannelDetails(user1.token, channel2.channelId)).toStrictEqual(403);
  });

  test('Testing base case', () => {
    expect(requestchannelDetails(user1.token, channel1.channelId)).toStrictEqual(
      {
        name: 'Channel1',
        isPublic: true,
        ownerMembers: [{
          uId: 0,
          email: 'example1@gmail.com',
          nameFirst: 'nicole',
          nameLast: 'Doe',
          handleStr: 'nicoledoe',
          profileImgUrl: defaultProfilePhoto
        }],
        allMembers: [{
          uId: 0,
          email: 'example1@gmail.com',
          nameFirst: 'nicole',
          nameLast: 'Doe',
          handleStr: 'nicoledoe',
          profileImgUrl: defaultProfilePhoto
        }],
      }
    );
  });

  test('Testing base case v2', () => {
    expect(requestchannelDetails(user1.token, channel3.channelId)).toStrictEqual(
      {
        name: 'Channel3',
        isPublic: true,
        ownerMembers: [{
          uId: 0,
          email: 'example1@gmail.com',
          nameFirst: 'nicole',
          nameLast: 'Doe',
          handleStr: 'nicoledoe',
          profileImgUrl: defaultProfilePhoto
        }],
        allMembers: [{
          uId: 0,
          email: 'example1@gmail.com',
          nameFirst: 'nicole',
          nameLast: 'Doe',
          handleStr: 'nicoledoe',
          profileImgUrl: defaultProfilePhoto
        }],
      }
    );
  });

  test('Testing base case v3', () => {
    expect(requestchannelDetails(user2.token, channel2.channelId)).toStrictEqual(
      {
        name: 'Channel2',
        isPublic: true,
        ownerMembers: [{
          uId: 1,
          email: 'example2@gmail.com',
          nameFirst: 'Bob',
          nameLast: 'Doe',
          handleStr: 'bobdoe',
          profileImgUrl: defaultProfilePhoto
        }],
        allMembers: [{
          uId: 1,
          email: 'example2@gmail.com',
          nameFirst: 'Bob',
          nameLast: 'Doe',
          handleStr: 'bobdoe',
          profileImgUrl: defaultProfilePhoto
        }],
      }
    );
  });

  test('Testing for duplicate names', () => {
    requestChannelJoin(user3.token, channel2.channelId);
    expect(requestchannelDetails(user3.token, channel2.channelId)).toStrictEqual(
      {
        name: 'Channel2',
        isPublic: true,
        ownerMembers: [{
          uId: 1,
          email: 'example2@gmail.com',
          nameFirst: 'Bob',
          nameLast: 'Doe',
          handleStr: 'bobdoe',
          profileImgUrl: defaultProfilePhoto
        }],
        allMembers: [{
          uId: 1,
          email: 'example2@gmail.com',
          nameFirst: 'Bob',
          nameLast: 'Doe',
          handleStr: 'bobdoe',
          profileImgUrl: defaultProfilePhoto
        }, {
          uId: 2,
          email: 'example3@gmail.com',
          nameFirst: 'Bob',
          nameLast: 'Doe',
          handleStr: 'bobdoe0',
          profileImgUrl: defaultProfilePhoto
        }],
      }
    );
  });
});
