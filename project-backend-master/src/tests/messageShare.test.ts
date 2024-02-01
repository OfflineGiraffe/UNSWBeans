import {
  requestClear, requestAuthRegister, requestDmCreate, requestChannelsCreate, 
  requestMessageSend, requestMessageSendDm, requestChannelJoin, requestMessageShare
} from '../wrapperFunctions';

import { newUser, newDm, newChannel, newMessage, getData} from '../dataStore';
requestClear();

afterEach(() => {
  requestClear();
});

describe('Testing react function', () => {
  let user0: newUser;
  let user1: newUser;
  let user2: newUser;
  let dm0: newDm;
  let dm1: newDm;
  let channel0: newChannel;
  let channel1: newChannel;
  let cMessage: newMessage;
  let dmMessage: newMessage;
  let cMessage2: newMessage; 

  beforeEach(() => {
    requestClear();
    user0 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'John', 'Doe');
    user1 = requestAuthRegister('example2@gmail.com', 'ABCD1234', 'Bob', 'Doe');
    dm0 = requestDmCreate(user0.token, [user1.authUserId]);
    dm1 = requestDmCreate(user0.token, [user1.authUserId]);
    channel0 = requestChannelsCreate(user0.token, 'Channel0', true);
    channel1 = requestChannelsCreate(user0.token, 'Channel1', true);
    requestChannelJoin(user1.token, channel0.channelId);
    cMessage = requestMessageSend(user0.token, channel0.channelId, 'Test Message Channel')
    dmMessage = requestMessageSendDm(user0.token, dm0.dmId, 'Test Message Dm')
    cMessage2 = requestMessageSend(user0.token, channel1.channelId, 'Test Message channel 2')

  });

  test('Error return (Channel id and dmId invalid)', () => {
    expect(requestMessageShare(user0.token, cMessage.messageId, 'Test', 1000000, 100000)).toStrictEqual(400);
  });

  test('Error returns (Neither channelId or DmId is not -1)', () => {
    expect(requestMessageShare(user0.token, cMessage.messageId, 'Test', channel1.channelId, dm1.dmId)).toStrictEqual(400);
  });

  test('Error returns (Invalid token)', () => {
    expect(requestMessageShare('Invalid Token', cMessage.messageId, 'Test', channel1.channelId, -1)).toStrictEqual(403);
  });

  test('Error returns (OgMessage Id is invalid)', () => {
    expect(requestMessageShare(user0.token, 10000 , 'Test', channel1.channelId, -1)).toStrictEqual(400);
  });

  test('Error returns (User is not part of channel which contains messageId)', () => {
    expect(requestMessageShare(user1.token, cMessage2.messageId, 'Test', channel0.channelId, -1)).toStrictEqual(400);
  });

  test('Error returns (Optional message is too long)', () => {
    /*eslint-disable */     // Lint returns "error  Multiline support is limited to browsers supporting ES5 only"
    const bigMessage: string = 'gsDYqv5lnOVTHwiqmzVRWqc6Acxu4t9JAyFW8aVKfGRS4urnbM2xy70bfznynOxgCUVdwqckCtMOq31IoiV\
    IZznF3m7lU5bGXdPoJrukmxajudHvSdVwpn1uL1vQBZXUe1yB56aLVKfVA1PzQPU1BNAzCrePCAAPHSE6lXCENn5yISjabwFbXi0A84hCfJqFAJ\
    wSZCD74oWhtdykrfqLT3qQhPil8s7WUslBErHLaYyzFcuWyAIHxXPTHDYA9hK24F1Fez6r7tx2Nw5n5jZb6tOqOJIWMUPVV6280uZqYeomn07Rp\
    9koabGH1dqLFpj6Xlh5if9Grmy3q78BUvnffRtzsz9ifJt8CW0DQWFpwuW4uU514FNPF0kmSMVWpJSGV5BCt0uCgf4mIowtGlEV8Joe8WjjTaDG\
    Lo9ssUI0zLaeiTaU5iIMWc1ky1ihtylnhy6XJYzHdmRdib0EVTBSGmjvZYHa85iSYzO5oD0lPCzwkz8hjURz51omlmPhGoWtgsJAebVag11FAAz\
    yTH0hX0VjPygBd2WNV4fnMz1BxwFb58vo6E1OXjQbabo1HA4sbfbZpHyzMtJUowdaelZLE0SUVHZigKMA8CaYT4vuvP5BakTdytYq3L2RhzyerP\
    SpZRYxcsRLo78IhDVzzm7SVVwZ1kUOcS5vyGnB1NtCylieNSGqWCN1YBtXmSNOoH8JS2eaYy4PYgGivOGrL05hQxrmPaWrnKT8tP0b1wHZGABAK\
    x1H6z0ldvBtluEdxMVMQ2jzOEPtcoFRDhWQrc9cn4IepW1tfxPlbv5dyK8ZUlPDlBzEUnxgagwEGoQA9SmVSeY0wXzrkoxxzkO7PwNfqHCiz7be\
    5LuopMDND8mwakQqa6oSvMd8JlCdECf67t3pIIQ0eGYYtYH4WzEGtv6l6US1yuY9GBuDO0mWgjCZO3Z9SNyByNY8mvCBsTKj1ntaHNoz4cJN7nh\
    ZtKu5Kd7iJ3LVOuYGNN71QVjaxnE4Qasdaqwdasdadwqdqd';
    /* eslint-enable */
    expect(requestMessageShare(user0.token, cMessage.messageId, bigMessage, channel1.channelId, -1)).toStrictEqual(400);
  });

  test('Error returns (User is not part of channel/Dm that message is being shared to)', () => {
    expect(requestMessageShare(user1.token, cMessage.messageId, 'Test', channel1.channelId, -1)).toStrictEqual(403);
  });

  test('Succesful return (Sharing from channel to channel)', () => {
    expect(requestMessageShare(user0.token, cMessage.messageId, 'Shared', channel1.channelId, -1)).toStrictEqual({ sharedMessageId: expect.any(Number)});
  });

  test('Successful return (Sharing from channel to Dm)', () => {
    expect(requestMessageShare(user0.token, cMessage.messageId, 'Shared', -1, dm0.dmId)).toStrictEqual({ sharedMessageId: expect.any(Number) });
  });

  test('Succesful return (sharing from dm to dm)', () => {
    expect(requestMessageShare(user0.token, dmMessage.messageId, 'Shared', -1, dm1.dmId)).toStrictEqual({ sharedMessageId: expect.any(Number) });  });

  test('Successful return (sharing from dm to channel)', () => {
    expect(requestMessageShare(user0.token, dmMessage.messageId, 'Shared', channel0.channelId, -1)).toStrictEqual({ sharedMessageId: expect.any(Number) });
  });
});