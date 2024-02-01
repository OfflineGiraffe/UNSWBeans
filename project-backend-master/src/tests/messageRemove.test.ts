import { newUser, newChannel, dmType } from '../dataStore';

import {
  requestClear, requestAuthRegister, requestChannelsCreate, requestChannelMessages, requestDmCreate, requestMessageSend, requestDmMessages,
  requestChannelJoin, requestMessageSendDm, requestMessageRemove
} from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe('message remove tests', () => {
  let user0: newUser;
  let user1: newUser;
  let channel1: newChannel;
  let dm0: dmType;

  beforeEach(() => {
    requestClear();
    user0 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'John', 'Doe');// uid: 0
    user1 = requestAuthRegister('example2@gmail.com', 'ABCD1234', 'Bob', 'Doe');// uid: 1

    channel1 = requestChannelsCreate(user0.token, 'Channel1', true);

    dm0 = requestDmCreate(user0.token, [user1.authUserId]);
  });

  test('Error returns', () => {
    const msg1 = requestMessageSend(user0.token, channel1.channelId, 'Message One');
    // invalid token
    expect(requestMessageRemove('INVALIDTOKEN', msg1.messageId)).toStrictEqual(403);
    // invalid messageId
    expect(requestMessageRemove(user0.token, 99)).toStrictEqual(400);
    // if user is not the original sender of the message
    expect(requestMessageRemove(user1.token, msg1.messageId)).toStrictEqual(403);
  });

  test('User with no owner permissions', () => {
    const msg1 = requestMessageSend(user0.token, channel1.channelId, 'Message One');
    requestChannelJoin(user1.token, channel1.channelId);
    expect(requestMessageRemove(user1.token, msg1.messageId)).toStrictEqual(403);
  });

  test('Correct returns', () => {
    const msg1 = requestMessageSend(user0.token, channel1.channelId, 'Message One');
    expect(requestMessageRemove(user0.token, msg1.messageId)).toStrictEqual({});
    expect(requestChannelMessages(user0.token, channel1.channelId, 0).messages).toStrictEqual([]);
  });

  test('Owner removes users message', () => {
    requestChannelJoin(user1.token, channel1.channelId);
    const msg1 = requestMessageSend(user1.token, channel1.channelId, 'I am not an owner');
    expect(requestMessageRemove(user0.token, msg1.messageId)).toStrictEqual({});
    expect(requestChannelMessages(user1.token, channel1.channelId, 0).messages).toStrictEqual([]);
  });

  test('Removing multiple messages', () => {
    requestChannelJoin(user1.token, channel1.channelId);
    const msg1 = requestMessageSend(user0.token, channel1.channelId, 'Message One');
    const msg2 = requestMessageSend(user1.token, channel1.channelId, 'Message Two');
    expect(requestMessageRemove(user1.token, msg2.messageId)).toStrictEqual({});
    expect(requestChannelMessages(user1.token, channel1.channelId, 0).messages).toStrictEqual([
      {
        message: 'Message One',
        messageId: msg1.messageId,
        uId: user0.authUserId,
        timeSent: expect.any(Number),
        reacts:  expect.any(Array),
        isPinned: expect.any(Boolean)
      },
    ]);
  });

  test('owner removes in dm', () => {
    const msg1 = requestMessageSendDm(user1.token, dm0.dmId, 'I am not an owner');
    expect(requestMessageRemove(user0.token, msg1.messageId)).toStrictEqual({});
    expect(requestDmMessages(user1.token, dm0.dmId, 0).messages).toStrictEqual([]);
  });

  test('multiple messages in dms', () => {
    const msg1 = requestMessageSendDm(user0.token, dm0.dmId, 'Message One in DMs');
    const msg2 = requestMessageSendDm(user1.token, dm0.dmId, 'Message two in DMs');
    expect(requestMessageRemove(user1.token, msg2.messageId)).toStrictEqual({});
    expect(requestDmMessages(user0.token, dm0.dmId, 0).messages).toStrictEqual([
      {
        message: 'Message One in DMs',
        messageId: msg1.messageId,
        uId: 0,
        timeSent: expect.any(Number),
        reacts:  expect.any(Array),
        isPinned: expect.any(Boolean)
      },
    ]);
  });
});
