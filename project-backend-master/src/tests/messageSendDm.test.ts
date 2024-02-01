import { newUser, dmType, newDm } from '../dataStore';

import {
  requestClear, requestAuthRegister, requestDmCreate, requestMessageSendDm
} from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe('Message Send Dm Tests', () => {
  let user0: newUser;
  let user1: newUser;
  let user2: newUser;
  let dm0: newDm;
  let dm1: newDm

  beforeEach(() => {
    requestClear();
    user0 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'John', 'Doe'); // uid = 0
    user1 = requestAuthRegister('example2@gmail.com', 'ABCD1234', 'Bob', 'Doe'); // uid = 1
    user2 = requestAuthRegister('example0@gmail.com', 'ABCD1234', 'Jeff', 'Doe'); // uid = 2
    dm1 = requestDmCreate(user1.token,[user0.authUserId]);
    dm0 = requestDmCreate(user0.token, [user1.authUserId]);
  });

  test(('Error returns (Invalid Message Length)'), () => {
    expect(requestMessageSendDm(user0.token, dm0.dmId, '')).toStrictEqual(400);
  });

  test(('Error returns (Invalid user token)'), () => {
    expect(requestMessageSendDm('Invalid Token', dm0.dmId, 'Test Message')).toStrictEqual(403);
  });

  test(('Error returns (Invalid DmId)'), () => {
    expect(requestMessageSendDm(user0.token, 1888, 'Test Message')).toStrictEqual(400);
  });

  test(('Error returns (token refers to user that is not a member of Dm)'), () => {
    expect(requestMessageSendDm(user2.token, dm0.dmId, 'Test Message')).toStrictEqual(403);
  });

  test(('Succesful return'), () => {
    expect(requestMessageSendDm(user0.token, dm0.dmId, 'Test Message')).toStrictEqual({ messageId: expect.any(Number) });
  });

  test(('Succesful return unique Id'), () => {
    const message = requestMessageSendDm(user0.token, dm0.dmId, 'Test Message');
    const message2 = requestMessageSendDm(user0.token, dm0.dmId, 'Test Message 2');
    expect(message).toStrictEqual({ messageId: expect.any(Number) });
    expect(message2).toStrictEqual({ messageId: expect.any(Number) });
    expect(message).not.toBe(message2);
  });
});
