import { newUser, newDm } from '../dataStore';

import {
  requestClear, requestAuthRegister, requestDmCreate, requestDmMessages, requestMessageEdit, requestMessageSendDm
} from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe('Dm Messages tests', () => {
  let user0: newUser;
  let user1: newUser;
  let user2: newUser;
  let dm0: newDm;
  let dm1: newDm;

  beforeEach(() => {
    requestClear();
    user0 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'John', 'Doe'); // uid = 0
    user1 = requestAuthRegister('example2@gmail.com', 'ABCD1234', 'Bob', 'Doe'); // uid = 1
    user2 = requestAuthRegister('example0@gmail.com', 'ABCD1234', 'Jeff', 'Doe'); // uid = 2

    dm0 = requestDmCreate(user0.token, [user1.authUserId]);
    dm1 = requestDmCreate(user0.token, [user1.authUserId, user2.authUserId]);
  });

  test('Error Returns', () => {
    // dmId does not refer to an existing Dm
    expect(requestDmMessages(user0.token, 69, 0)).toStrictEqual(400);

    // start is greater than no of messages in channel
    expect(requestDmMessages(user0.token, dm0.dmId, 50)).toStrictEqual(400);

    // dmId is valid but user is not member of that channel
    expect(requestDmMessages(user2.token, dm0.dmId, 0)).toStrictEqual(403);

    // authuserid is invalid
    expect(requestDmMessages('abc', dm1.dmId, 0)).toStrictEqual(403);
  });

  test('Correct Return', () => {
    // start is 0, should return empty messages array.
    expect(requestDmMessages(user1.token, dm1.dmId, 0)).toStrictEqual({ messages: [], start: 0, end: -1 });
  });

  test('Correct Return with 2 messages', () => {
    requestMessageSendDm(user0.token, dm0.dmId, 'Message 0');
    requestMessageSendDm(user0.token, dm0.dmId, 'Message 1');

    // start is 0, messages array should have 2 entires.
    expect(requestDmMessages(user0.token, dm0.dmId, 0)).toStrictEqual({
      start: 0,
      end: -1,
      messages: [
        {
          messageId: expect.any(Number),
          uId: user0.authUserId,
          message: 'Message 1',
          timeSent: expect.any(Number),
          reacts:  expect.any(Array),
          isPinned: expect.any(Boolean)
        },
        {
          messageId: expect.any(Number),
          uId: user0.authUserId,
          message: 'Message 0',
          timeSent: expect.any(Number),
          reacts:  expect.any(Array),
          isPinned: expect.any(Boolean)
        }
      ]
    });

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

    expect(requestMessageEdit(user0.token, dm0.dmId, bigMessage)).toStrictEqual(400);
  });

  test('Correct Return with 54 messages', () => {
    for (let i = 0; i < 54; i++) {
      requestMessageSendDm(user0.token, dm0.dmId, `Message ${i}`);
    }

    expect(requestDmMessages(user0.token, dm0.dmId, 3).start).toStrictEqual(3);
    expect(requestDmMessages(user0.token, dm0.dmId, 3).end).toStrictEqual(53);

    expect(requestDmMessages(user0.token, dm0.dmId, 3).messages).toContainEqual({
      messageId: expect.any(Number),
      uId: user0.authUserId,
      message: 'Message 5',
      timeSent: expect.any(Number),
      reacts:  expect.any(Array),
      isPinned: expect.any(Boolean)
    });

    expect(requestDmMessages(user0.token, dm0.dmId, 2).messages).toContainEqual({
      messageId: expect.any(Number),
      uId: user0.authUserId,
      message: 'Message 52',
      timeSent: expect.any(Number),
      reacts:  expect.any(Array),
      isPinned: expect.any(Boolean)
    });

    expect(requestDmMessages(user0.token, dm0.dmId, 2).messages).not.toContain({
      messageId: expect.any(Number),
      uId: user0.authUserId,
      message: 'Message 1',
      timeSent: expect.any(Number),
      reacts:  expect.any(Array),
      isPinned: expect.any(Boolean)
    });
  });
});
