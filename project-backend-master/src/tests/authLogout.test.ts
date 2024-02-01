import { requestClear, requestAuthRegister, requestAuthLogout, requestAuthLogin } from '../wrapperFunctions';
// Function Wrappers using above function

requestClear(); // Need to call it here before calling it in the beforeEach for some reason.

beforeEach(() => {
  requestClear();
});

describe('Testing authlogout function', () => {
  test('Successful logout (one token)', () => {
    const user = requestAuthRegister('example@gmail.com', 'ABCD1234', 'Aditya', 'Rana');
    expect(requestAuthLogout(user.token)).toStrictEqual({});
  });
  test('Successful logout (multiple tokens)', () => {
    const user = requestAuthRegister('example@gmail.com', 'ABCD1234', 'Aditya', 'Rana');
    const login = requestAuthLogin('example@gmail.com', 'ABCD1234');
    expect(requestAuthLogout(user.token)).toStrictEqual({});
    expect(requestAuthLogout(login.token)).toStrictEqual({});
  });

  test('Succesfu logout (Multiple Users)', () => {
    const user = requestAuthRegister('example@gmail.com', 'ABCD1234', 'Aditya', 'Rana');
    const user2 = requestAuthRegister('example2@gmail.com', 'ABCD1234', 'Nicole', 'Jiang');
    expect(requestAuthLogout(user.token)).toStrictEqual({});
    expect(requestAuthLogout(user2.token)).toStrictEqual({});
  });
  test('Failed logout (invalid token)', () => {
    requestAuthRegister('example@gmail.com', 'ABCD1234', 'Aditya', 'Rana');
    expect(requestAuthLogout('wrongToken')).toStrictEqual(403);
  });

  test(' 1 Successful logout and 1 failed (multiple tokens)', () => {
    const user = requestAuthRegister('example@gmail.com', 'ABCD1234', 'Aditya', 'Rana');
    requestAuthLogin('example@gmail.com', 'ABCD1234');
    expect(requestAuthLogout(user.token)).toStrictEqual({});
    expect(requestAuthLogout('wrongToken')).toStrictEqual(403);
  });
});
