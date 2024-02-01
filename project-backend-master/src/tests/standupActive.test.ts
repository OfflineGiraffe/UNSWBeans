import { newUser, newChannel } from '../dataStore';
import { sleep } from './testHelper';
import {
    requestClear, requestAuthRegister, requestChannelsCreate, requestChannelJoin, requestStandupStart, requestStandupActive
} from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe('standup active tests', () => {
  let user1: newUser;
  let user2: newUser;
  let channel1: newChannel;

  beforeEach(() => {
    requestClear();

    user1 = requestAuthRegister('example@gmail.com', 'ABCD1234', 'Bob', 'Doe');
    channel1 = requestChannelsCreate(user1.token, 'Channel1', true);

    user2 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'John', 'Doe');
  });

  test('error returns', () => {
    // invalid channel
    expect(requestStandupActive(user1.token, 99)).toStrictEqual(400);

    // user is not in the channel
    expect(requestStandupActive(user2.token, channel1.channelId)).toStrictEqual(403);

    // invalid user
    expect(requestStandupActive('abcde', channel1.channelId)).toStrictEqual(403);
  });

  test('standup is not active', () => {
    requestChannelJoin(user2.token, channel1.channelId);
    expect(requestStandupActive(user2.token, channel1.channelId)).toStrictEqual({ isActive: false, timeFinish: null });

  })

  test('Correct return', () => {
    requestChannelJoin(user2.token, channel1.channelId);
    requestStandupStart(user1.token, channel1.channelId, 10);
    expect(requestStandupActive(user2.token, channel1.channelId)).toStrictEqual({ isActive: true, timeFinish: expect.any(Number) });
  });

  test('Correct return, after startup has ended', () => {
    requestChannelJoin(user2.token, channel1.channelId);
    requestStandupStart(user1.token, channel1.channelId, 2);

    sleep(3);

    expect(requestStandupActive(user2.token, channel1.channelId)).toStrictEqual({ isActive: false, timeFinish: null });
  });
});
