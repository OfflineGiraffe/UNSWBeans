import { newUser } from '../dataStore';
import { defaultProfilePhoto } from '../helperFunctions';
import { requestClear, requestAuthRegister, requestUserProfile, requestUserSetHandle } from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe('userSetHandleV2 tests', () => {
  let user0: newUser;
  let user1: newUser;

  beforeEach(() => {
    requestClear();
    user0 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'Bob', 'Smith');
    user1 = requestAuthRegister('example2@gmail.com', 'EFGH5678', 'Carl', 'White');
  });

  // successfully changed the handle of user
  test('sucessfully changed the handle of user case 1', () => {
    expect(requestUserSetHandle(user0.token, 'bettyboop')).toStrictEqual({});
    expect(requestUserProfile(user0.token, user0.authUserId)).toStrictEqual(
      {
        user: {
          uId: 0,
          email: 'example1@gmail.com',
          nameFirst: 'Bob',
          nameLast: 'Smith',
          handleStr: 'bettyboop',
          profileImgUrl: defaultProfilePhoto
        }
      }
    );
  });

  // successfully changed to a previously existing handle of another user (that has been changed)
  test('successfully changed the handle of user case 2', () => {
    requestUserSetHandle(user0.token, 'bettyboop');
    expect(requestUserSetHandle(user1.token, 'bobsmith')).toStrictEqual({});
    expect(requestUserProfile(user1.token, user1.authUserId)).toStrictEqual(
      {
        user: {
          uId: 1,
          email: 'example2@gmail.com',
          nameFirst: 'Carl',
          nameLast: 'White',
          handleStr: 'bobsmith',
          profileImgUrl: defaultProfilePhoto
        }
      }
    );
  });

  // handle string length is too short
  test('throw error if handle is too short', () => {
    expect(requestUserSetHandle(user0.token, 'hi')).toStrictEqual(400);
  });

  // handle string length is too long
  test('throw error if handle is too long', () => {
    expect(requestUserSetHandle(user0.token, 'abcdefghijklmnopqrstuvwxyz')).toStrictEqual(400);
  });

  // handle string contains non-alphanumeric characters
  test('throw error if handle contains non-alphanumeric characters', () => {
    expect(requestUserSetHandle(user0.token, 'carlwhite!')).toStrictEqual(400);
  });

  // handle string already exists
  test('throw error if handle already exists', () => {
    expect(requestUserSetHandle(user0.token, 'carlwhite')).toStrictEqual(400);
  });

  // token is invalid
  test('throw error if token is invalid', () => {
    expect(requestUserSetHandle('a', 'bettyboop')).toStrictEqual(403);
  });
});
