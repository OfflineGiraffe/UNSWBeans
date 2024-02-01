import { requestClear, requestAuthRegister, requestChannelsCreate, requestChannelsList } from '../wrapperFunctions';
import { newUser } from '../dataStore';

requestClear();

afterEach(() => {
  requestClear();
});

describe('channelsList tests', () => {
  let user: newUser;

  beforeEach(() => {
    requestClear();
    user = requestAuthRegister('example1@gmail.com', 'Abcd1234', 'Luke', 'Smith');
  });

  test('Testing error return', () => {
    expect(requestChannelsList('abcd')).toStrictEqual(403);
  });

  test('testing user in multiple channels', () => {
    const channel = requestChannelsCreate(user.token, 'Channel', true) as { channelId: number };
    const channel1 = requestChannelsCreate(user.token, 'Channel1', true) as { channelId: number };
    const channel2 = requestChannelsCreate(user.token, 'Channel2', true) as { channelId: number };

    expect(requestChannelsList(user.token)).toStrictEqual({
      channels: [
        {
          channelId: channel.channelId,
          name: 'Channel',
        },
        {
          channelId: channel1.channelId,
          name: 'Channel1',
        },
        {
          channelId: channel2.channelId,
          name: 'Channel2',
        },
      ]
    });
  });

  test('testing channel owner in channel', () => {
    const channel3 = requestChannelsCreate(user.token, 'Channel3', true) as { channelId: number };
    expect(requestChannelsList(user.token)).toStrictEqual({
      channels: [
        {
          channelId: channel3.channelId,
          name: 'Channel3',
        }
      ]
    });
  });

  test('Testing if no channel is creating', () => {
    expect(requestChannelsList(user.token)).toStrictEqual({
      channels: []
    });
  });
});
