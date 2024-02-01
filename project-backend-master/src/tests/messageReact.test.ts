import {
  requestClear, requestAuthRegister, requestDmCreate, requestChannelsCreate, requestMessageReact, 
  requestMessageSend, requestMessageSendDm, requestChannelJoin, requestDmMessages, requestChannelMessages,
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

  test('Error return (Invalid messageId)', () => {
    expect(requestMessageReact(user0.token, 1212, 1)).toStrictEqual(400);
  });

  test('Error return (Invalid ReactId)', () => {
    expect(requestMessageReact(user0.token, channelMessage.messageId, 10)).toStrictEqual(400);
  });

  test('Error return (Invalid token)', () => {
    expect(requestMessageReact('Invalid Token', channelMessage.messageId, 1)).toStrictEqual(403);
  });

  test('Error return (Message already contains reactId from user)', () => {
    expect(requestMessageReact(user0.token, channelMessage.messageId, 1)).toStrictEqual({});
    expect(requestMessageReact(user0.token, channelMessage.messageId, 1)).toStrictEqual(400);
  });
  
  test('Successful return (Message in Channel)', () => {
    expect(requestMessageReact(user0.token, channelMessage.messageId, 1)).toStrictEqual({});
  });

  test('Succesful return (Message in Dm)', () => {
    requestDmMessages(user0.token, dm.dmId, 0);
    expect(requestMessageReact(user0.token, dmMessage.messageId, 1)).toStrictEqual({}); 
    requestDmMessages(user0.token, dm.dmId, 0);
    requestDmMessages(user1.token, dm.dmId, 0);
  });

  test ('Successful return (Message in Dm and in channel)', () => {
    requestChannelMessages(user0.token, channel.channelId, 0);
    expect(requestMessageReact(user0.token, dmMessage.messageId, 1)).toStrictEqual({});
    expect(requestMessageReact(user1.token, dmMessage.messageId, 1)).toStrictEqual({});
    expect(requestMessageReact(user0.token, channelMessage.messageId, 1)).toStrictEqual({});
    requestChannelMessages(user0.token, channel.channelId, 0);
    requestChannelMessages(user1.token, channel.channelId, 0);
    expect(requestMessageReact(user1.token, channelMessage.messageId, 1)).toStrictEqual({})
  });
})