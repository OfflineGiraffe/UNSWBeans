import { newUser, newChannel } from '../dataStore';
import {
  requestClear, requestAuthRegister, requestChannelsCreate, requestChannelJoin, requestChannelsList
} from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe('channelJoin tests', () => {
  let user1: newUser;
  let user2: newUser;
  let channel1: newChannel;
  let channel2: newChannel;
  let channel3: newChannel;

  let user3: newUser;

  beforeEach(() => {
    requestClear();

    user1 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'nicole', 'Doe');
    channel1 = requestChannelsCreate(user1.token, 'Channel1', false);

    user2 = requestAuthRegister('example2@gmail.com', 'ABCD1234', 'Bob', 'Doe');
    channel2 = requestChannelsCreate(user2.token, 'Channel2', true);
    channel3 = requestChannelsCreate(user2.token, 'Channel3', false);
  });

  test('error returns', () => {
    // invalid channel
    expect(requestChannelJoin(user1.token, 99)).toStrictEqual(400);

    // user is already in channel
    expect(requestChannelJoin(user1.token, channel1.channelId)).toStrictEqual(400);

    // channel is private and user is not already a channel member or a global owner
    expect(requestChannelJoin(user2.token, channel1.channelId)).toStrictEqual(403);

    // invalid user
    expect(requestChannelJoin('abcde', channel1.channelId)).toStrictEqual(403);
  });

  test('Correct Returns', () => {
    user3 = requestAuthRegister('example3@gmail.com', 'ABCD1234', 'Jake', 'Doe');
    // user joining a public channel
    expect(requestChannelsList(user3.token)).toStrictEqual({ channels: [] });

    expect(requestChannelJoin(user3.token, channel2.channelId)).toStrictEqual({});

    expect(requestChannelsList(user3.token)).toStrictEqual({
      channels: [{ channelId: channel2.channelId, name: 'Channel2' }]
    });

    // global owner joining a private channel
    expect(requestChannelsList(user1.token)).toStrictEqual({
      channels: [{ channelId: channel1.channelId, name: 'Channel1' }]
    });

    expect(requestChannelJoin(user1.token, channel3.channelId)).toStrictEqual({});

    expect(requestChannelsList(user1.token)).toStrictEqual({
      channels: [
        { channelId: channel1.channelId, name: 'Channel1' },
        { channelId: channel3.channelId, name: 'Channel3' },
      ]
    });
  });
});
