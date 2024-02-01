import {
  requestClear, requestAuthRegister, requestDmCreate, requestChannelsCreate, requestMessageReact, 
  requestMessageSend, requestMessageSendDm, requestChannelJoin, requestMessageUnreact
} from '../wrapperFunctions';

import { newUser, newDm, newChannel, newMessage} from '../dataStore';
requestClear();

afterEach(() => {
  requestClear();
});
describe('Testing react function', () => {
  let user0: newUser;
  let user1: newUser;
  let user2: newUser;
  let dm: newDm;
  let channel: newChannel;
  let channelMessage: newMessage;
  let dmMessage: newMessage; 

  beforeEach(() => {
    requestClear();
    user0 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'John', 'Doe');
    user1 = requestAuthRegister('example2@gmail.com', 'ABCD1234', 'Bob', 'Doe');
    dm = requestDmCreate(user0.token, [user1.authUserId]);
    channel = requestChannelsCreate(user0.token, 'Channel1', true);
    requestChannelJoin(user1.token, channel.channelId);
    channelMessage = requestMessageSend(user0.token, channel.channelId, 'Test Message Channel')
    dmMessage = requestMessageSendDm(user0.token, dm.dmId, 'Test Message Dm')

  });

  test('Error return (Invalid MessageId)', () => {
    requestMessageReact(user0.token, channelMessage.messageId, 1);
    expect(requestMessageUnreact(user0.token, 100000, 1)).toStrictEqual(400);
  });  

  test('Error return (Invalid token)', () => {
    requestMessageReact(user0.token, channelMessage.messageId, 1);
    expect(requestMessageUnreact('Invalid Token', channelMessage.messageId, 1)).toStrictEqual(403);
  })

  test('Error return (Invalid reactId)', () => {
    requestMessageReact(user0.token, channelMessage.messageId, 1);
    expect(requestMessageUnreact(user0.token, channelMessage.messageId, 100)).toStrictEqual(400);
  })

  test('Error return (user has not reacted)', () => {
    expect(requestMessageUnreact(user0.token, channelMessage.messageId, 1)).toStrictEqual(400);
  })

  test('Successful return (Channel Message)', () => {
    requestMessageReact(user0.token, channelMessage.messageId, 1);
    expect(requestMessageUnreact(user0.token, channelMessage.messageId, 1)).toStrictEqual({});
  })

  test('Successful return (Dm Message)', () => {
    requestMessageReact(user0.token, dmMessage.messageId, 1);
    expect(requestMessageUnreact(user0.token, dmMessage.messageId, 1)).toStrictEqual({});
  })
});