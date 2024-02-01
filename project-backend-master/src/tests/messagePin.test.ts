import { newUser, newChannel, dmType } from '../dataStore';

import {
  requestClear, requestAuthRegister, requestChannelsCreate, requestChannelJoin, requestMessageSend, requestMessagePin,
  requestDmCreate, requestMessageSendDm, requestChannelMessages, requestDmMessages
} from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe('Message Pin tests', () => {
  let user0: newUser;
  let user1: newUser;
  let channel0: newChannel;
  let dm0: dmType;

  beforeEach(() => {
    requestClear();
    user0 = requestAuthRegister('example0@gmail.com', 'ABCD1234', 'Jeff', 'Doe'); // uid = 0
    user1 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'John', 'Doe'); // uid = 1

    channel0 = requestChannelsCreate(user0.token, 'Channel1', true);
    dm0 = requestDmCreate(user0.token, [user1.authUserId]);
  });

  test('Errors for invalid id and unauthorised user', () => {
    requestChannelJoin(user1.token, channel0.channelId);
    const msg1 = requestMessageSend(user0.token, channel0.channelId, 'THE FIRST MESSAGE BY OWNER IN CHANNEL');
    const msgdm = requestMessageSendDm(user0.token, dm0.dmId, 'FIRST MESSAGE BY THE OWNER IN DM');

    expect(requestMessagePin(user0.token, 0)).toStrictEqual(400); // invalid message id
    expect(requestMessagePin('RANDOM TOKEN', msg1.messageId)).toStrictEqual(403); // invalid message id
    expect(requestMessagePin(user1.token, parseInt(msg1.messageId))).toStrictEqual(403); // unauthorised user pinning in channel
    expect(requestMessagePin(user1.token, parseInt(msgdm.messageId))).toStrictEqual(403); // unauthorised user pinning in Dm
  });

  test('Error if not in channel/dm', () => {
    const msg1 = requestMessageSend(user0.token, channel0.channelId, 'THE FIRST MESSAGE BY OWNER');
    const msgdm = requestMessageSendDm(user0.token, dm0.dmId, 'FIRST MESSAGE BY THE OWNER IN DM');
    const user2: newUser = requestAuthRegister('example5@gmail.com', 'ABCD1234', 'John', 'Doe'); // uid = 2

    expect(requestMessagePin(user2.token, msg1.messageId)).toStrictEqual(400);
    expect(requestMessagePin(user2.token, msgdm.messageId)).toStrictEqual(400);
  });

  test('Error if already pinned', () => {
    requestChannelJoin(user1.token, channel0.channelId);
    const msg1 = requestMessageSend(user0.token, channel0.channelId, 'THE FIRST MESSAGE BY OWNER');
    const msgdm = requestMessageSendDm(user0.token, dm0.dmId, 'FIRST MESSAGE BY THE OWNER IN DM');

    requestMessagePin(user0.token, msg1.messageId);
    requestMessagePin(user0.token, msgdm.messageId);

    expect(requestMessagePin(user0.token, msg1.messageId)).toStrictEqual(400);
    expect(requestMessagePin(user0.token, msgdm.messageId)).toStrictEqual(400);
  });

  test('Correctly Pins a message', () => {
    const msg1 = requestMessageSend(user0.token, channel0.channelId, 'THE FIRST MESSAGE BY OWNER');
    const msgdm = requestMessageSendDm(user0.token, dm0.dmId, 'FIRST MESSAGE BY THE OWNER IN DM');

    requestMessagePin(user0.token, msg1.messageId);
    requestMessagePin(user0.token, msgdm.messageId);
    expect(requestChannelMessages(user0.token, channel0.channelId, 0).messages).toStrictEqual([
      {
        message: 'THE FIRST MESSAGE BY OWNER',
        messageId: msg1.messageId,
        uId: user0.authUserId,
        timeSent: expect.any(Number),
        reacts: expect.any(Array),
        isPinned: true,
      },
    ]);

    expect(requestDmMessages(user0.token, dm0.dmId, 0).messages).toContainEqual({
      messageId: expect.any(Number),
      uId: user0.authUserId,
      message: 'FIRST MESSAGE BY THE OWNER IN DM',
      timeSent: expect.any(Number),
      reacts: expect.any(Array),
      isPinned: true,
    });
  });
});
