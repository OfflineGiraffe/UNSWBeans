import { requestClear, requestAuthRegister, requestAuthLogin } from '../wrapperFunctions';
// Function Wrappers using above function

requestClear(); // Need to call it here before calling it in the beforeEach for some reason.

beforeEach(() => {
  requestClear();
});

describe('Testing authLogin function', () => {
  // Testing login details are valid (registered)
  test('Testing successful login', () => {
    requestAuthRegister('example@gmail.com', 'ABCD1234', 'Nicole', 'Jiang');
    const login = requestAuthLogin('example@gmail.com', 'ABCD1234');
    expect(login).toStrictEqual(
      {
        token: expect.any(String),
        authUserId: expect.any(Number)
      });
  });

  // Email and password are valid/registered, but don't match (for different users)
  test("Testing failed login (registered email and password don't match)", () => {
    requestAuthRegister('example@gmail.com', 'ABCD1234', 'Nicole', 'Jiang');
    requestAuthRegister('example2@gmail.com', 'WXYZ5678', 'Aditya', 'Rana12');
    const login = requestAuthLogin('example@gmail.com', 'WXYZ5678');
    expect(login).toStrictEqual(400);
  });

  // Email (right) / Password (does not exist)
  test('Testing failed login (password does not exist)', () => {
    requestAuthRegister('example@gmail.com', 'ABCD1234', 'Nicole', 'Jiang');
    const login = requestAuthLogin('example@gmail.com', 'QWERTY');
    expect(login).toStrictEqual(400);
  });

  // Email (does not exist) / Password (null)
  test('Testing failed login (email does not exist)', () => {
    requestAuthRegister('example@gmail.com', 'ABCD1234', 'Nicole', 'Jiang');
    const login = requestAuthLogin('csesoc@gmail.com', 'ABCD1234');
    expect(login).toStrictEqual(400);
  });
});
