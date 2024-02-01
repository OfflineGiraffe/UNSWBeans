import { requestClear, requestAuthRegister, requestAuthLogin, requestAuthPasswordResetRequest, requestAuthPasswordResetReset } from '../wrapperFunctions';
import { userType, getData } from '../dataStore';

requestClear(); 

beforeEach(() => {
  requestClear();
});

describe('authPasswordResetReset tests', () => {
  test(('resetCode is not a valid reset code'), () => {
	requestAuthRegister('nicole.jiang@gmail.com', 'ABCD1234', 'Nicole', 'Jiang');
	requestAuthPasswordResetRequest('nicole.jiang@gmail.com');
	expect(requestAuthPasswordResetReset('invalidcode', 'ABCDE12345')).toStrictEqual(400);
  });

  test(('newPassword is less than 6 characters long'), () => {
	const user = requestAuthRegister('nicole.jiang@gmail.com', 'ABCD1234', 'Nicole', 'Jiang');
	requestAuthPasswordResetRequest('nicole.jiang@gmail.com');
	expect(requestAuthPasswordResetReset(user.resetCode, 'short')).toStrictEqual(400);
  })
});

