import { newUser } from '../dataStore';
import { defaultProfilePhoto } from '../helperFunctions';
import { requestClear, requestAuthRegister, requestUserProfile, requestUserSetName } from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe('Testing for userSetNameV2', () => {
  let user1: newUser;

  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'nicole', 'Doe');
  });

  // successfully reset first name, last name
  test('successfully reset names', () => {
    expect(requestUserSetName(user1.token, 'geoffrey', 'mok')).toStrictEqual({});
    expect(requestUserProfile(user1.token, user1.authUserId)).toStrictEqual(
      {
        user: {
          uId: 0,
          email: 'example1@gmail.com',
          nameFirst: 'geoffrey',
          nameLast: 'mok',
          handleStr: 'nicoledoe',
          profileImgUrl: defaultProfilePhoto
        }
      }
    );
  });

  // token is invalid
  test('throw error if invalid token', () => {
    expect(requestUserSetName('a', 'geoffrey', 'mok')).toStrictEqual(403);
  });

  // length of first name is not less than 50 characters
  test('throw error if first name is too long', () => {
    expect(requestUserSetName(user1.token, 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz', 'mok')).toStrictEqual(400);
  });

  // length of first name is not 1 character or greater (blank)
  test('throw error if first name is blank', () => {
    expect(requestUserSetName(user1.token, '', 'mok')).toStrictEqual(400);
  });

  // length of last name is not less than 50 characters
  test('throw error if last name is too long', () => {
    expect(requestUserSetName(user1.token, 'geoffrey', 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz')).toStrictEqual(400);
  });

  // length of last name is not 1 character or greater (blank)
  test('throw error if last name is blank', () => {
    expect(requestUserSetName(user1.token, 'mok', '')).toStrictEqual(400);
  });
});
