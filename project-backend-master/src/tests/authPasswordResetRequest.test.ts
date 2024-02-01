import { requestClear, requestAuthRegister, requestAuthPasswordResetRequest } from '../wrapperFunctions';
// Function Wrappers using above function

requestClear(); // Need to call it here before calling it in the beforeEach for some reason.

beforeEach(() => {
  requestClear();
});

describe('Returns', () => {
  test('Email not in use, should return an empty object', () => {
    requestAuthRegister('example@gmail.com', 'ABCD1234', 'Aditya', 'Rana');
    expect(requestAuthPasswordResetRequest('exam@gmail.com')).toStrictEqual({});
  });

  test('Email in use, should send an email and generate a reset code.', () => {
    requestAuthRegister('example@gmail.com', 'ABCD1234', 'Aditya', 'Rana');
    expect(requestAuthPasswordResetRequest('example@gmail.com')).toStrictEqual({});
  });

  // Add more tests
});
