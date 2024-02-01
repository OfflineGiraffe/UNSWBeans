import { newUser, dmType, newDm } from '../dataStore';

import {
  requestClear, requestAuthRegister, requestDmCreate, requestMessageSendDm, requestMessageSendLaterDm
} from '../wrapperFunctions';

requestClear();

beforeEach(() => {
  requestClear();
});

describe('messageSendLaterDm tests', () => {
	let user0: newUser;
	let user1: newUser;
	let user2: newUser;
	let dm0: newDm;
	let dm1: newDm;
	let timeSent: number;
	  
	beforeEach(() => {
		requestClear();
		user0 = requestAuthRegister('example0@gmail.com', 'ABCD1234', 'Jeff', 'Doe'); // uid = 0
		user1 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'John', 'Doe'); // uid = 1
		user2 = requestAuthRegister('example0@gmail.com', 'ABCD1234', 'Jeff', 'Doe'); // uid = 2
    	dm1 = requestDmCreate(user1.token,[user0.authUserId]);
    	dm0 = requestDmCreate(user0.token, [user1.authUserId]);
		timeSent = Math.floor(Date.now() / 1000);
	});

	// dmId does not refer to a valid DM
	test(('invalid dmId'), () => {
		expect(requestMessageSendLaterDm(user0.token, 2000, 'Test Message', timeSent)).toStrictEqual(400);
	});

	// length of the message is less than 1 character
	test(('length of message is less than 1 character'), () => {
		expect(requestMessageSendLaterDm(user0.token, dm0.dmId, '', timeSent)).toStrictEqual(400);
	});

	// length of the message is over 1000 characters
	test(('length of message is over 1000 characters'), () => {
		const bigMessage = 'a'.repeat(1001);
		expect(requestMessageSendLaterDm(user0.token, dm0.dmId, bigMessage, timeSent)).toStrictEqual(400);
	});

	// timeSent is a time in the past
	test(('timeSent is a time in the past'), () => {
		expect(requestMessageSendLaterDm(user0.token, dm0.dmId, 'Test Message', timeSent - 1)).toStrictEqual(400);
	});

	// authorised user is not a member of the DM they are trying to post to
	test(('authorised user is not a member of the respective DM'), () => {
		expect(requestMessageSendLaterDm(user2.token, dm0.dmId, 'Test Message', timeSent)).toStrictEqual(403);
	});

	// token is invalid 
	test(('invalid token'), () => {
		expect(requestMessageSendLaterDm('a', dm0.dmId, 'Test Message', timeSent)).toStrictEqual(403);
	});

	// success case
	test(('successfully sent a DM later'), () => {
		expect(requestMessageSendLaterDm(user0.token, dm0.dmId, 'Test Message', timeSent)).toStrictEqual({ messageId: expect.any(Number) });
	});
});