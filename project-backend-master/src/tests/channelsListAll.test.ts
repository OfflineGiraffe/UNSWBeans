import { requestClear, requestAuthRegister, requestChannelsCreate, requestChannelsListAll } from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe('ChannelsListAll tests', () => {
  let token: string;
  // User needs to be created in order test this function
  beforeEach(() => {
    requestClear();
    token = requestAuthRegister('example@gmail.com', 'ABCD1234', 'Aditya', 'Rana').token;
  });

  test('Testing successful channelsListAll (Private and Public)', () => {
    const channel1 = requestChannelsCreate(token, 'Channel1', true) as { channelId: number };
    const channel2 = requestChannelsCreate(token, 'Channel2', true) as { channelId: number };

    expect(requestChannelsListAll(token)).toStrictEqual({
      channels: [
        {
          channelId: channel1.channelId,
          name: 'Channel1',
        },
        {
          channelId: channel2.channelId,
          name: 'Channel2',
        }
      ]
    });
  });

  test('Testing successful channelsListAll (More Channels))', () => {
    const channel1 = requestChannelsCreate(token, 'Channel1', true) as { channelId: number };
    const channel2 = requestChannelsCreate(token, 'Channel2', false) as { channelId: number };
    const channel3 = requestChannelsCreate(token, 'Channel3', true) as { channelId: number };
    const channel4 = requestChannelsCreate(token, 'Channel4', false) as { channelId: number };

    expect(requestChannelsListAll(token)).toStrictEqual({
      channels: [
        {
          channelId: channel1.channelId,
          name: 'Channel1',
        },
        {
          channelId: channel2.channelId,
          name: 'Channel2',
        },
        {
          channelId: channel3.channelId,
          name: 'Channel3',
        },
        {
          channelId: channel4.channelId,
          name: 'Channel4',
        },
      ]
    });
  });
  test('Testing successful channelsListAll (No channels)', () => {
    expect(requestChannelsListAll(token)).toStrictEqual({
      channels: []
    });
  });

  test('Testing failed channelsListAll (invalid token)', () => {
    requestChannelsCreate(token, 'Channel', false);
    expect(requestChannelsListAll('InvalidToken')).toEqual(403);
  });
});
