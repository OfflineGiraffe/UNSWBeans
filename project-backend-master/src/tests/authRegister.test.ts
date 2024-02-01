import { requestClear, requestAuthRegister } from '../wrapperFunctions';
// Function Wrappers using above function

requestClear(); // Need to call it here before calling it in the beforeEach for some reason.

beforeEach(() => {
  requestClear();
});

describe('Testing authRegister function', () => {
  test('Testing successful registration', () => {
    const user = requestAuthRegister('example@gmail.com', 'ABCD1234', 'Aditya', 'Rana');
    expect(user).toStrictEqual(
      {
        token: expect.any(String),
        authUserId: expect.any(Number)
      });
  });

  test('Testing successful registration (Removing Non alpha-Numeric)', () => {
    const user = requestAuthRegister('example@gmail.com', 'ABCD1234', 'Aditya12$#', 'Rana31');
    expect(user).toStrictEqual(
      {
        token: expect.any(String),
        authUserId: expect.any(Number)
      });
  });

  test('Testing successful registration (Multiple Users, Unique ID and token)', () => {
    const user = requestAuthRegister('example@gmail.com', 'ABCD1234', 'Aditya12', 'Rana21');
    const user2 = requestAuthRegister('example2@gmail.com', 'ABCD1234', 'Aditya12', 'Rana21');
    expect(user).toStrictEqual(
      {
        token: expect.any(String),
        authUserId: expect.any(Number)
      });
    expect(user2).toStrictEqual(
      {
        token: expect.any(String),
        authUserId: expect.any(Number)
      });

    expect(user2.authUserId).not.toBe(user.authUserId);
    expect(user2.token).not.toBe(user.token);
  });

  test('Testing successful Registration (User handle too long)', () => {
    const user = requestAuthRegister('example@gmail.com', 'ABCD1234', 'Aditya1234345342312', 'Rana2134342123');
    expect(user).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
  });

  test('Testing Succesful Registration (Handle is already in use)', () => {
    const user = requestAuthRegister('example@gmail.com', 'ABCD1234', 'Aditya12', 'Rana21');
    const user2 = requestAuthRegister('example2@gmail.com', 'ABCD1234', 'Aditya12', 'Rana21');
    const user3 = requestAuthRegister('example3@gmail.com', 'ABCD1234', 'Aditya12', 'Rana21');
    expect(user).toStrictEqual(
      {
        token: expect.any(String),
        authUserId: expect.any(Number)
      });
    expect(user2).toStrictEqual(
      {
        token: expect.any(String),
        authUserId: expect.any(Number)
      });
    expect(user3).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
  });

  test('Testing failed registration (password being too short)', () => {
    const user = requestAuthRegister('example@gmail.com', 'ABC12', 'Aditya', 'Rana');
    expect(user).toStrictEqual(400);
  });

  test('Testing failed registration Invalid email', () => {
    const user = requestAuthRegister('examplegmail.comm', 'ABC12', 'Aditya', 'Rana');
    expect(user).toStrictEqual(400);
  });

  test('Testing failed registration (email already used by another user)', () => {
    requestAuthRegister('example2@gmail.com', 'ABCD12', 'Aditya', 'Rana');
    const user2 = requestAuthRegister('example2@gmail.com', 'ABCD1234', 'Aditya', 'Rana');
    expect(user2).toStrictEqual(400);
  });

  test('Testing Failed registration (no first name)', () => {
    const user = requestAuthRegister('example@gmail.com', 'ABC123', '', 'Rana');
    expect(user).toStrictEqual(400);
  });

  test('Testing failed registration (no surname)', () => {
    const user = requestAuthRegister('example@gmail.com', 'ABC123', 'Aditya', '');
    expect(user).toStrictEqual(400);
  });

  test('Testing failed registration (name is too long)', () => {
    const user = requestAuthRegister('example@gmail.com', 'ABC123', 'Adityasdqwasdasdqed12341dsacdacasdadw13ascqavrsdfsa', 'Rana');
    expect(user).toStrictEqual(400);
  });
});
