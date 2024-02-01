import { newUser, newDm } from '../dataStore';

import {
  requestClear, requestAuthRegister, requestDmCreate, requestDmRemove
} from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe(('DM remove tests'), () => {
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
    requestDmCreate(user0.token, [user1.authUserId, user2.authUserId, user3.authUserId]);
    expect(requestDmRemove(user1.token, 0)).toStrictEqual(403);
    expect(requestDmRemove(user0.token, 1)).toStrictEqual(400);
    expect(requestDmRemove('RANDOM TOKEN', 0)).toStrictEqual(403);
    expect(requestDmRemove(user1.token, 0)).toStrictEqual(403);
    expect(requestDmRemove(user2.token, 0)).toStrictEqual(403);
    // Do one for dm leave
  });

  test(('For one dm, owner removes it'), () => {
    const dm0: newDm = requestDmCreate(user0.token, [user1.authUserId, user2.authUserId, user3.authUserId]);
    expect(requestDmRemove(user0.token, dm0.dmId)).toStrictEqual({});
  });

  test(('For multiple dm, owner removes it'), () => {
    requestDmCreate(user0.token, [user1.authUserId, user2.authUserId, user3.authUserId]);
    const dm1: newDm = requestDmCreate(user1.token, [user0.authUserId, user2.authUserId, user3.authUserId]);
    requestDmCreate(user3.token, [user1.authUserId]);
    expect(requestDmRemove(user1.token, dm1.dmId)).toStrictEqual({});
  });
});
