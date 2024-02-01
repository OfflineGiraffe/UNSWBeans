import { newUser, dmType } from '../dataStore';

import {
  requestClear, requestAuthRegister, requestDmCreate, requestDmList
} from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe('Dm List Tests', () => {
  let user0: newUser;
  let user1: newUser;
  let user2: newUser;
  let dm0: dmType;

  beforeEach(() => {
    requestClear();
    user0 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'John', 'Doe'); // uid = 0
    user1 = requestAuthRegister('example2@gmail.com', 'ABCD1234', 'Bob', 'Doe'); // uid = 1
    user2 = requestAuthRegister('example0@gmail.com', 'ABCD1234', 'Jeff', 'Doe'); // uid = 2
    dm0 = requestDmCreate(user0.token, [user1.authUserId]);
  });

  test('Error Returns', () => {
    // user doesnt exist
    expect(requestDmList('abc')).toStrictEqual(403);
  });

  test('Correct Returns', () => {
    expect(requestDmList(user0.token)).toStrictEqual({ dms: [{ dmId: dm0.dmId, name: 'bobdoe, johndoe' }] });
    expect(requestDmList(user1.token)).toStrictEqual({ dms: [{ dmId: dm0.dmId, name: 'bobdoe, johndoe' }] });

    const dm1 = requestDmCreate(user0.token, [user1.authUserId, user2.authUserId]);
    const user3 = requestAuthRegister('example3@gmail.com', 'ABCD1234', 'Steve', 'Doe') as {token: string, authUserId: number}; // uid = 3
    const dm2 = requestDmCreate(user0.token, [user1.authUserId, user2.authUserId, user3.authUserId]);

    expect(requestDmList(user0.token)).toStrictEqual({
      dms: [
        { dmId: dm0.dmId, name: 'bobdoe, johndoe' },
        { dmId: dm1.dmId, name: 'bobdoe, jeffdoe, johndoe' },
        { dmId: dm2.dmId, name: 'bobdoe, jeffdoe, johndoe, stevedoe' },
      ]
    });
  });
});
