import { newUser } from '../dataStore';

import {
  requestClear, requestAuthRegister, requestDmCreate, requestDmList
} from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe(('DM Create tests'), () => {
  let user0: newUser;
  let user1: newUser;
  let user2: newUser;
  let user3: newUser;

  beforeEach(() => {
    requestClear();
    user0 = requestAuthRegister('example0@gmail.com', 'ABCD1234', 'Jeff', 'Doe') as {token: string, authUserId: number}; // uid = 0
    user1 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'John', 'Doe') as {token: string, authUserId: number}; // uid = 1
    user2 = requestAuthRegister('example2@gmail.com', 'ABCD1234', 'Bob', 'Doe') as {token: string, authUserId: number}; // uid = 2
    user3 = requestAuthRegister('example3@gmail.com', 'ABCD1234', 'Bob', 'Doe') as {token: string, authUserId: number}; // uid = 3
  });

  test(('Error returns'), () => {
    expect(requestDmCreate(user0.token, [user1.authUserId, user2.authUserId, user3.authUserId, 4])).toStrictEqual(400);
    expect(requestDmCreate(user0.token, [user1.authUserId, user1.authUserId])).toStrictEqual(400);
    expect(requestDmCreate('token1', [user1.authUserId, user2.authUserId])).toStrictEqual(403);
  });

  test(('Correct returns'), () => {
    expect(requestDmCreate(user0.token, [user1.authUserId, user2.authUserId])).toStrictEqual({ dmId: expect.any(Number) });

    requestDmCreate(user0.token, [user1.authUserId]);

    const expectedDms2 = { dms: [{ dmId: expect.any(Number), name: expect.any(String) }, { dmId: expect.any(Number), name: expect.any(String) }] };
    const expectedDms1 = { dms: [{ dmId: expect.any(Number), name: expect.any(String) }] };

    expect(requestDmList(user0.token)).toMatchObject(expectedDms2);
    expect(requestDmList(user1.token)).toMatchObject(expectedDms2);
    expect(requestDmList(user2.token)).toMatchObject(expectedDms1);
    expect(requestDmList(user3.token)).toMatchObject({ dms: [] });
  });
});
