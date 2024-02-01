import { newUser } from '../dataStore';
import { defaultProfilePhoto } from '../helperFunctions';
import { requestClear, requestAuthRegister, requestUserProfile, requestUserSetEmail } from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe('userSetEmailV2 tests', () => {
  let user0: newUser;
  let user1: newUser;

  beforeEach(() => {
    requestClear();
    user0 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'Bob', 'Smith');
    user1 = requestAuthRegister('example2@gmail.com', 'EFGH5678', 'Carl', 'White');
  });

  // successfully changed email
  test('successfully changed emails case 1', () => {
    expect(requestUserSetEmail(user0.token, 'example0@gmail.com')).toStrictEqual({});
    expect(requestUserProfile(user0.token, user0.authUserId)).toStrictEqual(
      {
        user:
            {
              uId: 0,
              email: 'example0@gmail.com',
              nameFirst: 'Bob',
              nameLast: 'Smith',
              handleStr: 'bobsmith',
              profileImgUrl: defaultProfilePhoto
            }
      }
    );
  });

  // successfully changed emails to a previously existing email (has changed)
  test('successfully changed emails case 2', () => {
    expect(requestUserSetEmail(user0.token, 'example0@gmail.com')).toStrictEqual({});
    expect(requestUserSetEmail(user1.token, 'example1@gmail.com')).toStrictEqual({});
    expect(requestUserProfile(user0.token, user0.authUserId)).toStrictEqual(
      {
        user:
            {
              uId: 0,
              email: 'example0@gmail.com',
              nameFirst: 'Bob',
              nameLast: 'Smith',
              handleStr: 'bobsmith',
              profileImgUrl: defaultProfilePhoto
            }
      }
    );
  });

  // email is in the invalid format
  test('throw error if email is in the invalid format', () => {
    expect(requestUserSetEmail(user0.token, 'example@gmail...com')).toStrictEqual(400);
  });

  // no email has been inputted
  test('throw error if no email has been inputted', () => {
    expect(requestUserSetEmail(user0.token, '')).toStrictEqual(400);
  });

  // invalid token
  test('throw error if the token is invalid', () => {
    expect(requestUserSetEmail('a', 'example0@gmail.com')).toStrictEqual(403);
  });

  // email already exists
  test('throw error if no email is already in use', () => {
    expect(requestUserSetEmail(user0.token, 'example2@gmail.com')).toStrictEqual(400);
  });

  // email isn't being changed (sub-category)
  test('throw error if the new email has not been changed', () => {
    expect(requestUserSetEmail(user0.token, 'example1@gmail.com')).toStrictEqual(400);
  });
});
