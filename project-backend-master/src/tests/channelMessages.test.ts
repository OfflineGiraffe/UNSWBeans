import { newUser, newChannel } from '../dataStore';
import {
  requestClear, requestAuthRegister, requestChannelsCreate, requestChannelMessages, requestMessageSend
} from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe('Channel Messages tests', () => {
  let user1: newUser;
  let user2: newUser;
  let channel1: newChannel;
  let channel2: newChannel;

  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'John', 'Doe');
    channel1 = requestChannelsCreate(user1.token, 'Channel1', true);

    user2 = requestAuthRegister('example2@gmail.com', 'ABCD1234', 'Bob', 'Doe');
    channel2 = requestChannelsCreate(user2.token, 'Channel2', true);
  });

  test('Error Returns', () => {
    // channelid does not refer to an existing channel
    expect(requestChannelMessages(user1.token, 69, 0)).toStrictEqual(400);

    // start is greater than no of messages in channel
    expect(requestChannelMessages(user1.token, channel1.channelId, 50)).toStrictEqual(400);

    // channelid is valid but user is not member of that channel
    expect(requestChannelMessages(user1.token, channel2.channelId, 0)).toStrictEqual(403);

    // authuserid is invalid
    expect(requestChannelMessages('abc', channel1.channelId, 0)).toStrictEqual(403);
  });

  test('Correct Return with no messages', () => {
    // start is 0, should return empty messages array.
    expect(requestChannelMessages(user1.token, channel1.channelId, 0)).toStrictEqual({ messages: [], start: 0, end: -1 });
  });

  test('Correct Return with 2 messages', () => {
    requestMessageSend(user2.token, channel2.channelId, 'Message 0');
    requestMessageSend(user2.token, channel2.channelId, 'Message 1');

    // start is 0, messages array should have 2 entires.
    expect(requestChannelMessages(user2.token, channel2.channelId, 0)).toStrictEqual({
      start: 0,
      end: -1,
      messages: [
        {
          messageId: expect.any(Number),
          uId: user2.authUserId,
          message: 'Message 1',
          timeSent: expect.any(Number),
          reacts:  expect.any(Array),
          isPinned: expect.any(Boolean),
        },
        {
          messageId: expect.any(Number),
          uId: user2.authUserId,
          message: 'Message 0',
          timeSent: expect.any(Number),
          reacts:  expect.any(Array),
          isPinned: expect.any(Boolean)
        }
      ]
    });
  });

  test('Correct Return with 53 messages', () => {
    for (let i = 0; i < 53; i++) {
      requestMessageSend(user2.token, channel2.channelId, `Message ${i}`);
    }

    expect(requestChannelMessages(user2.token, channel2.channelId, 2).start).toStrictEqual(2);
    expect(requestChannelMessages(user2.token, channel2.channelId, 2).end).toStrictEqual(52);

    expect(requestChannelMessages(user2.token, channel2.channelId, 2).messages).toContainEqual({
      messageId: expect.any(Number),
      uId: user2.authUserId,
      message: 'Message 5',
      timeSent: expect.any(Number),
      reacts:  expect.any(Array),
      isPinned: expect.any(Boolean)
    });

    expect(requestChannelMessages(user2.token, channel2.channelId, 2).messages).toContainEqual({
      messageId: expect.any(Number),
      uId: user2.authUserId,
      message: 'Message 51',
      timeSent: expect.any(Number),
      reacts:  expect.any(Array),
      isPinned: expect.any(Boolean)
    });

    expect(requestChannelMessages(user2.token, channel2.channelId, 2).messages).not.toContain({
      messageId: expect.any(Number),
      uId: user2.authUserId,
      message: 'Message 0',
      timeSent: expect.any(Number),
      reacts:  expect.any(Array),
      isPinned: expect.any(Boolean)
    });
  });
});
