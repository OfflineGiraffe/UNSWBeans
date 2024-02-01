import { waitForDebugger } from 'inspector';
import { newUser, newChannel } from '../dataStore';

import {
  requestClear, requestAuthRegister, requestChannelsCreate, requestChannelMessages, requestMessageSendLater, requestChannelJoin
} from '../wrapperFunctions';

requestClear();

beforeEach(() => {
  requestClear();
});

describe('messageSendLater tests', () => {
    let user0: newUser;
    let user1: newUser;
    let channel0: newChannel;
    let timeSent: any;
      
    beforeEach(() => {
      requestClear();
      user0 = requestAuthRegister('example0@gmail.com', 'ABCD1234', 'Jeff', 'Doe'); // uid = 0
      user1 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'John', 'Doe'); // uid = 1
      channel0 = requestChannelsCreate(user0.token, 'Channel1', true);
      timeSent = Math.floor(Date.now() / 1000);
    });

    // channelId does not refer to a valid channel
    test(('invalid channel'), () => {
      expect(requestMessageSendLater(user0.token, 1000, 'Test Message', timeSent)).toStrictEqual(400);
    });

    // length of the message is less than 1
    test(('message length < 1'), () => {
      expect(requestMessageSendLater(user0.token, channel0.channelId, '', timeSent)).toStrictEqual(400);
    });
    
    // length of the message is over 1000 characters
    test(('message length > 1000'), () => {
      const bigMessage = 'a'.repeat(1001);
      const timeSent = Math.floor(Date.now() / 1000);
      expect(requestMessageSendLater(user0.token, channel0.channelId, bigMessage, timeSent)).toStrictEqual(400);
    });
      

    // timeSent is a time in the past
    test(('timeSet is a time in the past'), () => {
      expect(requestMessageSendLater(user0.token, channel0.channelId, 'Test Message', timeSent - 1)).toStrictEqual(400);
    });

    // channelId is valid and the authorised user is not a member of the channel they are trying to post to
    test(('authorised user is not a member of the channel'), () => {
      expect(requestMessageSendLater(user1.token, channel0.channelId, 'Test Message 1', timeSent)).toStrictEqual(403);
    });

    // token is invalid
    test(('token is invalid'), () => {
      expect(requestMessageSendLater('a', channel0.channelId, 'Test Message 1', timeSent)).toStrictEqual(403);
    });

    // success case
    test(('successfully sent message later'), () => {
      requestChannelJoin(user1.token, channel0.channelId);
      expect(requestMessageSendLater(user1.token, channel0.channelId, 'Test Message', timeSent + 100)).toStrictEqual({ messageId: expect.any(Number) });
    });
});