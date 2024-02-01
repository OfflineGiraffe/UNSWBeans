import { newUser, newChannel, dmType } from '../dataStore';
import { sleep } from './testHelper';

import {
  requestClear, requestAuthRegister, requestChannelsCreate, requestChannelMessages, requestDmCreate, requestMessageSend, requestDmMessages,
  requestMessageEdit, requestChannelJoin, requestMessageSendDm, requestStandupSend, requestStandupStart, requestStandupActive,
  requestMessageShare
} from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe('Message Edit', () => {
  let user0: newUser;
  let user1: newUser;
  let channel0: newChannel;
  let dm0: dmType;

  beforeEach(() => {
    requestClear();
    user0 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'Bob', 'Doe'); // uid = 0
    user1 = requestAuthRegister('example2@gmail.com', 'ABCD1234', 'John', 'Doe'); // uid = 1
    dm0 = requestDmCreate(user0.token, [user1.authUserId]);
    channel0 = requestChannelsCreate(user0.token, 'Channel 1', true);
  });

  test(('Error returns'), () => {
    const msg1 = requestMessageSend(user0.token, channel0.channelId, 'Test Message 1');
    const msg2 = requestMessageSendDm(user0.token, dm0.dmId, 'Sending Dm');
    expect(requestMessageEdit('RANDOMTOKEN ', msg1.messageId, 'NOT THE CORRECT TOKEN')).toStrictEqual(403);
    expect(requestMessageEdit(user0.token, 0, 'NOT THE CORRECT MESSAGE ID')).toStrictEqual(400);
    expect(requestMessageEdit(user1.token, msg1.messageId, 'NOT THE CORRECT USER')).toStrictEqual(403);
    expect(requestMessageEdit('RANDOMTOKEN ', msg2.messageId, 'NOT THE CORRECT TOKEN')).toStrictEqual(403);
    expect(requestMessageEdit(user0.token, 0, 'NOT THE CORRCET MESSAGE ID')).toStrictEqual(400);
    expect(requestMessageEdit(user1.token, msg2.messageId, ' NOT THE CORRECT USER')).toStrictEqual(403);
  });

  test(('error, no owner perms and change other messages'), () => {
    const msg1 = requestMessageSend(user0.token, channel0.channelId, 'Test Message 1');
    requestChannelJoin(user1.token, channel0.channelId);
    expect(requestMessageEdit(user1.token, msg1.messageId, 'Change message when not owner')).toStrictEqual(403);
  });

  test(('Correct returns'), () => {
    const msg1 = requestMessageSend(user0.token, channel0.channelId, 'Test Message 1');
    requestMessageEdit(user0.token, msg1.messageId, 'Message change');
    expect(requestChannelMessages(user0.token, channel0.channelId, 0).messages).toContainEqual(
      {
        message: 'Message change',
        messageId: msg1.messageId,
        uId: user0.authUserId,
        timeSent: expect.any(Number),
        reacts:  expect.any(Array),
        isPinned: expect.any(Boolean)
      }
    );
  });

  test(('Correct returns, deletes if message is nothing'), () => {
    const msg1 = requestMessageSend(user0.token, channel0.channelId, 'Test Message 1');
    requestMessageEdit(user0.token, msg1.messageId, '');
    expect(requestChannelMessages(user0.token, channel0.channelId, 0).messages).toStrictEqual(
      []
    );
  });

  test(('Correct returns, owner edits another persons message'), () => {
    requestChannelJoin(user1.token, channel0.channelId);
    const msg1 = requestMessageSend(user1.token, channel0.channelId, 'Test Message 1');
    requestMessageEdit(user0.token, msg1.messageId, 'OWNER PERMISIONS ARE THE BEST MESSAGE');
    expect(requestChannelMessages(user0.token, channel0.channelId, 0).messages).toContainEqual(
      {
        message: 'OWNER PERMISIONS ARE THE BEST MESSAGE',
        messageId: msg1.messageId,
        uId: user1.authUserId,
        timeSent: expect.any(Number),
        reacts:  expect.any(Array),
        isPinned: expect.any(Boolean)
      }
    );
  });

  test(('Correct returns, Multiple messages'), () => {
    requestChannelJoin(user1.token, channel0.channelId);
    const msg2 = requestMessageSend(user0.token, channel0.channelId, 'Random text');
    const msg3 = requestMessageSend(user1.token, channel0.channelId, 'Test Message 3');

    requestMessageEdit(user1.token, msg3.messageId, 'RANDOM MESSAGE BY SECOND USER.');
    expect(requestChannelMessages(user1.token, channel0.channelId, 0).messages).toStrictEqual([
      {
        message: 'RANDOM MESSAGE BY SECOND USER.',
        messageId: msg3.messageId,
        uId: user1.authUserId,
        timeSent: expect.any(Number),
        reacts:  expect.any(Array),
        isPinned: expect.any(Boolean)
      },
      {
        message: 'Random text',
        messageId: msg2.messageId,
        uId: user0.authUserId,
        timeSent: expect.any(Number),
        reacts:  expect.any(Array),
        isPinned: expect.any(Boolean)
      }
    ]
    );
  });
  // FOR DMS NOW when message send avaliable

  test(('Correct returns, for dms'), () => {
    const msg2 = requestMessageSendDm(user0.token, 0, 'Random text');
    const msg3 = requestMessageSendDm(user1.token, 0, 'Test Message 3');

    requestMessageEdit(user1.token, msg3.messageId, 'RANDOM MESSAGE BY SECOND USER.');
    expect(requestDmMessages(user0.token, dm0.dmId, 0)).toStrictEqual({
      messages: [
        {
          message: 'RANDOM MESSAGE BY SECOND USER.',
          messageId: msg3.messageId,
          timeSent: expect.any(Number),
          uId: 1,
          reacts:  expect.any(Array),
          isPinned: expect.any(Boolean)
        },
        {
          message: 'Random text',
          messageId: msg2.messageId,
          timeSent: expect.any(Number),
          uId: 0,
          reacts:  expect.any(Array),
          isPinned: expect.any(Boolean)
        }
      ],
      start: 0,
      end: -1
    });
  });

  test(('Correct returns, for dms'), () => {
    const msg2 = requestMessageSendDm(user0.token, 0, 'Random text');
    const msg3 = requestMessageSendDm(user1.token, 0, 'Test Message 3');

    requestMessageEdit(user1.token, msg3.messageId, '');
    expect(requestDmMessages(user0.token, dm0.dmId, 0)).toStrictEqual({
      messages: [
        {
          message: 'Random text',
          messageId: msg2.messageId,
          timeSent: expect.any(Number),
          uId: 0,
          reacts:  expect.any(Array),
          isPinned: expect.any(Boolean)
        }
      ],
      start: 0,
      end: -1
    });
  });

  test(('Correct returns, standup messages'), () => {
    requestChannelJoin(user1.token, channel0.channelId);
    const msg2 = requestMessageSend(user0.token, channel0.channelId, 'Random text');
    const msg3 = requestMessageSend(user1.token, channel0.channelId, 'Test Message 3');

    requestStandupStart(user0.token, channel0.channelId, 2);

    requestStandupSend(user0.token, channel0.channelId, "The first message in a standup");
    requestStandupSend(user1.token, channel0.channelId, "The second message in a standup");
    requestStandupSend(user0.token, channel0.channelId, "The third message in a standup");

    sleep(3);

    requestStandupActive(user0.token, channel0.channelId)

    // cannot test message edit for standup as none of the functions return the message id. not sure how to implement.
    // hower it should still work as if they pass through a valid message id, it will search and edit the message.
    // requestMessageEdit(user0.token, msg3.messageId, 'RANDOM MESSAGE BY SECOND USER.');

    expect(requestChannelMessages(user1.token, channel0.channelId, 0).messages).toStrictEqual([
      {
        message: 'bobdoe: The first message in a standup\njohndoe: The second message in a standup\nbobdoe: The third message in a standup',
        messageId: expect.any(Number),
        uId: user0.authUserId,
        timeSent: expect.any(Number),
        reacts:  expect.any(Array),
        isPinned: expect.any(Boolean)
      },
      {
        message: 'Test Message 3',
        messageId: msg3.messageId,
        uId: user1.authUserId,
        timeSent: expect.any(Number),
        reacts:  expect.any(Array),
        isPinned: expect.any(Boolean)
      },
      {
        message: 'Random text',
        messageId: msg2.messageId,
        uId: user0.authUserId,
        timeSent: expect.any(Number),
        reacts:  expect.any(Array),
        isPinned: expect.any(Boolean)
      },
    ]
    );
  });

  test(('Correct returns, editing shared in channel messages'), () => {
    requestChannelJoin(user1.token, channel0.channelId);
    const msg2 = requestMessageSend(user0.token, channel0.channelId, 'Random text');
    const msg3 = requestMessageSend(user1.token, channel0.channelId, 'Test Message 3');
    const msg = requestMessageShare(user1.token, msg3.messageId, 'Shared message', channel0.channelId, -1)

    requestMessageEdit(user1.token, msg.sharedMessageId, 'RANDOM MESSAGE BY FIRST USER.');

    expect(requestChannelMessages(user1.token, channel0.channelId, 0).messages).toStrictEqual([
      {
        message: 'RANDOM MESSAGE BY FIRST USER.',
        messageId: msg.sharedMessageId,
        uId: user1.authUserId,
        timeSent: expect.any(Number),
        reacts:  expect.any(Array),
        isPinned: expect.any(Boolean)
      },
      {
        message: 'Test Message 3',
        messageId: msg3.messageId,
        uId: user1.authUserId,
        timeSent: expect.any(Number),
        reacts:  expect.any(Array),
        isPinned: expect.any(Boolean)
      },
      {
        message: 'Random text',
        messageId: msg2.messageId,
        uId: user0.authUserId,
        timeSent: expect.any(Number),
        reacts:  expect.any(Array),
        isPinned: expect.any(Boolean)
      }
    ]
    );
  });

  test(('Correct returns, editing shared in dm messages'), () => {
    const msg2 = requestMessageSendDm(user0.token, 0, 'Random text');
    const msg3 = requestMessageSendDm(user1.token, 0, 'Test Message 3');
    const msg = requestMessageShare(user0.token, msg3.messageId, 'Shared', -1, dm0.dmId)

    requestMessageEdit(user0.token, msg.sharedMessageId, 'RANDOM MESSAGE BY SECOND USER.');

    expect(requestDmMessages(user0.token, dm0.dmId, 0)).toStrictEqual({
      messages: [
        {
          message: 'RANDOM MESSAGE BY SECOND USER.',
          messageId: msg.sharedMessageId,
          timeSent: expect.any(Number),
          uId: user0.authUserId,
          reacts:  expect.any(Array),
          isPinned: expect.any(Boolean)
        },
        {
          message: 'Test Message 3',
          messageId: msg3.messageId,
          uId: user1.authUserId,
          timeSent: expect.any(Number),
          reacts:  expect.any(Array),
          isPinned: expect.any(Boolean)
        },
        {
          message: 'Random text',
          messageId: msg2.messageId,
          timeSent: expect.any(Number),
          uId: 0,
          reacts:  expect.any(Array),
          isPinned: expect.any(Boolean)
        }
      ],
      start: 0,
      end: -1
    });
  });

});
