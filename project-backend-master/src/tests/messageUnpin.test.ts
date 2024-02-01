
import { newUser, newChannel, dmType} from '../dataStore';

import {requestClear, requestAuthRegister, requestChannelsCreate, requestDmCreate, requestChannelJoin, requestMessageSend,
        requestMessageSendDm, requestMessagePin, requestMessageUnpin, requestChannelMessages, requestDmMessages
} from '../wrapperFunctions';

requestClear();

afterEach(() => {
    requestClear();
});


describe('Message unpin tests', () => {
  let user0: newUser;
  let user1: newUser;
  let channel0: newChannel;
  let dm0: dmType;

  beforeEach(() => {
    requestClear();
    user0 = requestAuthRegister('example0@gmail.com', 'ABCD1234', 'Bob', 'Doe'); // uid = 0
    user1 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'John', 'Doe'); // uid = 1

    channel0 = requestChannelsCreate(user0.token, 'Channel1', true);
    dm0 = requestDmCreate(user0.token, [1]);
  });

  test('Errors returns', () => {
    requestChannelJoin(user1.token, channel0.channelId);
    const msg1 = requestMessageSend(user0.token, channel0.channelId, 'Message one in channel');
    const msg2 = requestMessageSendDm(user0.token, dm0.dmId, 'Message one in dm');
    requestMessagePin(user0.token, msg1.messageId);
    requestMessagePin(user0.token, msg2.messageId);
    // Invalid messageId
    expect(requestMessageUnpin(user0.token, 99)).toStrictEqual(400);
    // Invalid token
    expect(requestMessageUnpin('INVALID TOKEN', msg1.messageId)).toStrictEqual(403);
    // user has no owner permissions in channel/dm
    expect(requestMessageUnpin(user1.token, parseInt(msg1.messageId))).toStrictEqual(403);
    expect(requestMessageUnpin(user1.token, parseInt(msg2.messageId))).toStrictEqual(403);
  });

  test('return error if already unpinned', () => {
    const msg1 = requestMessageSend(user0.token, channel0.channelId, 'Message one in channel');
    const msg2 = requestMessageSendDm(user0.token, dm0.dmId, 'Message one in dm');

    requestMessagePin(user0.token, msg1.messageId);
    requestMessagePin(user0.token, msg2.messageId);

    requestMessageUnpin(user0.token, msg1.messageId);
    requestMessageUnpin(user0.token, msg2.messageId);

    expect(requestMessageUnpin(user0.token, msg1.messageId)).toStrictEqual(400);
    expect(requestMessageUnpin(user0.token, msg2.messageId)).toStrictEqual(400);
  });

  test('return error if not in channel/dm', () => {
    const msg1 = requestMessageSend(user0.token, channel0.channelId, 'Message one in channel');
    const msg2 = requestMessageSendDm(user0.token, dm0.dmId, 'Message one in dm');
    const user2: newUser = requestAuthRegister('example2@gmail.com', 'ABCD1234', 'Jake', 'Doe'); // uid = 2

    requestMessagePin(user0.token, msg1.messageId);
    requestMessagePin(user0.token, msg2.messageId);

    expect(requestMessageUnpin(user2.token, msg1.messageId)).toStrictEqual(400);
    expect(requestMessageUnpin(user2.token, msg2.messageId)).toStrictEqual(400);
  });

  test('correct return', () => {
    const msg1 = requestMessageSend(user0.token, channel0.channelId, 'Message one in channel');
    const msg2 = requestMessageSendDm(user0.token, dm0.dmId, 'Message one in dm');

    requestMessagePin(user0.token, msg1.messageId);
    requestMessagePin(user0.token, msg2.messageId);

    requestMessageUnpin(user0.token, msg1.messageId);
    requestMessageUnpin(user0.token, msg2.messageId);
    expect(requestChannelMessages(user0.token, channel0.channelId, 0).messages).toStrictEqual([
      {
        message: 'Message one in channel',
        messageId: msg1.messageId,
        uId: user0.authUserId,
        timeSent: expect.any(Number),
        reacts: expect.any(Array),
        isPinned: false,
      },
    ]);

    expect(requestDmMessages(user0.token, dm0.dmId, 0).messages).toContainEqual({
      message: 'Message one in dm',
      messageId: expect.any(Number),
      uId: user0.authUserId,
      timeSent: expect.any(Number),
      reacts: expect.any(Array),
      isPinned: false,
    });
  });
});

