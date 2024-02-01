import { newUser, newChannel } from '../dataStore';
import { sleep } from './testHelper';
import {
  requestClear, requestAuthRegister, requestChannelsCreate, requestStandupStart, requestStandupSend,
  requestChannelMessages, requestChannelJoin, requestStandupActive
} from '../wrapperFunctions';

requestClear();

let user1: newUser;
let channel1: newChannel;

let user2: newUser;

beforeEach(() => {
  requestClear();

  user1 = requestAuthRegister('example@gmail.com', 'ABCD1234', 'Bob', 'Doe');
  channel1 = requestChannelsCreate(user1.token, 'Channel1', true);

  user2 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'John', 'Doe');
});

afterEach(() => {
  requestClear();
});

describe('Error Testing', () => {
  test('error returns', () => {
    requestStandupStart(user1.token, channel1.channelId, 2);

    expect(requestStandupSend("Random token", channel1.channelId, "MESSAGE")).toStrictEqual(403);

    expect(requestStandupSend(user1.token, 10, "MESSAGE")).toStrictEqual(400);

    expect(requestStandupSend("Random token", channel1.channelId, "MESSAGE")).toStrictEqual(403);

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
    ZtKu5Kd7iJ3LVOuYGNN71QVjaxnE4Q';
    /* eslint-enable */
  
      expect(requestStandupSend(user1.token, channel1.channelId, bigMessage)).toStrictEqual(400);
      expect(requestStandupSend(user2.token, channel1.channelId, "Message but not a user in channel")).toStrictEqual(403);

  });

  test('error returns when theres no active standup', () => {

    expect(requestStandupSend("Random token", channel1.channelId, "MESSAGE")).toStrictEqual(403);

    expect(requestStandupSend(user1.token, 10, "MESSAGE")).toStrictEqual(400);

    expect(requestStandupSend("Random token", channel1.channelId, "MESSAGE")).toStrictEqual(403);

    expect(requestStandupSend(user2.token, channel1.channelId, "Message but not a user in channel")).toStrictEqual(403);

    expect(requestStandupSend(user1.token, channel1.channelId, "Message but no standup active")).toStrictEqual(400);
  });

});

describe('error', () => {
  test('User not in channel.', () => {
    requestStandupStart(user1.token, channel1.channelId, 1);

    sleep(1.5);

    expect(requestStandupSend(user2.token, channel1.channelId, "Message but not a user in channel")).toStrictEqual(403);

  });
});

describe('Correct', () => {
    test('COrrect return v1', () => {
      requestChannelJoin(user2.token, channel1.channelId);
      requestStandupStart(user1.token, channel1.channelId, 1);
  
      requestStandupSend(user1.token, channel1.channelId, "The first message in a standup");
      requestStandupSend(user2.token, channel1.channelId, "The second message in a standup");
      requestStandupSend(user1.token, channel1.channelId, "The third message in a standup");

      sleep(1.5);
      
      requestStandupActive(user1.token, channel1.channelId)

      expect(requestChannelMessages(user1.token, channel1.channelId, 0).messages).toStrictEqual([
        {
          message: 'bobdoe: The first message in a standup\njohndoe: The second message in a standup\nbobdoe: The third message in a standup',
          messageId: expect.any(Number),
          uId: user1.authUserId,
          timeSent: expect.any(Number),
          reacts:  expect.any(Array),
          isPinned: expect.any(Boolean)
        },
      ]
      );
    
  
    });
  });
  
