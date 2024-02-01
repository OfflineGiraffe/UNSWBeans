import { newUser } from '../dataStore';
import { defaultProfilePhoto } from '../helperFunctions';
import { requestClear, requestAuthRegister, requestUsersAll } from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe('usersAllv1 tests', () => {
  let user0: newUser;
  beforeEach(() => {
    requestClear();
    user0 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'Bob', 'Smith');// uid = 0
  });

  test('Error return', () => {
    expect(requestUsersAll('abcd')).toStrictEqual(403);
  });

  test('show user details when given a valid token', () => {
    expect(requestUsersAll(user0.token)).toStrictEqual({
      users: [
        {
          uId: 0,
          email: 'example1@gmail.com',
          nameFirst: 'Bob',
          nameLast: 'Smith',
          handleStr: 'bobsmith',
          profileImgUrl: defaultProfilePhoto
        }
      ]
    });
    requestAuthRegister('example2@gmail.com', 'Abcd1234', 'Jake', 'Doe');
    expect(requestUsersAll(user0.token)).toStrictEqual({
      users: [
        {
          uId: 0,
          email: 'example1@gmail.com',
          nameFirst: 'Bob',
          nameLast: 'Smith',
          handleStr: 'bobsmith',
          profileImgUrl: defaultProfilePhoto
        },
        {
          uId: 1,
          email: 'example2@gmail.com',
          nameFirst: 'Jake',
          nameLast: 'Doe',
          handleStr: 'jakedoe',
          profileImgUrl: defaultProfilePhoto
        }
      ]

    });
    requestAuthRegister('example3@gmail.com', 'Abcd1234', 'Jacob', 'Doe');
    expect(requestUsersAll(user0.token)).toStrictEqual({
      users: [
        {
          uId: 0,
          email: 'example1@gmail.com',
          nameFirst: 'Bob',
          nameLast: 'Smith',
          handleStr: 'bobsmith',
          profileImgUrl: defaultProfilePhoto
        },
        {
          uId: 1,
          email: 'example2@gmail.com',
          nameFirst: 'Jake',
          nameLast: 'Doe',
          handleStr: 'jakedoe',
          profileImgUrl: defaultProfilePhoto
        },
        {
          uId: 2,
          email: 'example3@gmail.com',
          nameFirst: 'Jacob',
          nameLast: 'Doe',
          handleStr: 'jacobdoe',
          profileImgUrl: defaultProfilePhoto
        },
      ]
    });
  });
});
