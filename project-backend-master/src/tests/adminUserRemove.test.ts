import { newUser, newChannel, newDm, message, userShort } from '../dataStore';
import { defaultProfilePhoto } from '../helperFunctions';
import {
  requestClear, requestAuthRegister, requestChannelsCreate, requestAdminUserRemove, requestChannelJoin, requestUsersAll, requestUserProfile, requestDmCreate,
  requestMessageSend, requestChannelMessages, requestMessageSendDm, requestDmMessages, requestMessagePin, requestchannelDetails, requestDmDetails
} from '../wrapperFunctions';

requestClear();

let user1: newUser;
let user2: newUser;
let user3: newUser;

let channel1: newChannel;
let dm1: newDm

beforeEach(() => {
    requestClear();

    user1 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'John', 'Doe');
    user2 = requestAuthRegister('example2@gmail.com', 'ABCD1234', 'Bob', 'Doe');
    user3 = requestAuthRegister('example3@gmail.com', 'ABCD1234', 'Jeff', 'Doe');

    channel1 = requestChannelsCreate(user1.token, 'Channel1', true);

    dm1 = requestDmCreate(user1.token, [1, 2]);
});

afterEach(() => {
  requestClear();
});


describe('Error Return Tests', () => {

    test('400 Error returns', () => {

        // Invalid uId, user doesn't exist
        expect(requestAdminUserRemove(user1.token, 4)).toStrictEqual(400);

        // User 1 is the only global owner, so an error must be thrown.
        expect(requestAdminUserRemove(user1.token, user1.authUserId)).toStrictEqual(400);

    });

    test('403 Error Returns', () => {
        
        // Invalid token
        expect(requestAdminUserRemove('abcde', user1.authUserId)).toStrictEqual(403);

        // Authorising user is not a global owner.
        expect(requestAdminUserRemove(user2.token, user3.authUserId)).toStrictEqual(403);
    });

});



describe('Correct Returns and correct changes', () => {


    test('Example Correct Return', () => {

        const userBob: userShort = {
            uId: 1,
            email: 'example2@gmail.com',
            nameFirst: 'Bob',
            nameLast: 'Doe',
            handleStr: 'bobdoe',
            profileImgUrl: defaultProfilePhoto
        };

        expect(requestUsersAll(user1.token).users).toContainEqual( userBob );

        expect(requestUserProfile(user1.token, user2.authUserId).user).toStrictEqual( userBob );

        expect(requestAdminUserRemove(user1.token, user2.authUserId)).toStrictEqual( {} );

        expect(requestUserProfile(user1.token, user2.authUserId).user).toStrictEqual( {
            uId: 1,
            email: '',
            nameFirst: 'Removed',
            nameLast: 'user',
            handleStr: '',
            profileImgUrl: defaultProfilePhoto
        });

        expect(requestUsersAll(user1.token).users).not.toContainEqual( userBob );


    });

    
    
    test('Correct change for channel messages and channel members', () => {

        requestChannelJoin(user2.token, channel1.channelId);
        requestChannelJoin(user3.token, channel1.channelId);

        const msg1: message = requestMessageSend(user2.token, channel1.channelId, 'Message from user with uId 1');
        const msg2: message = requestMessageSend(user3.token, channel1.channelId, 'Message from user with uId 2');

        const userJeff: userShort = {
            uId: 2,
            email: 'example3@gmail.com',
            nameFirst: 'Jeff',
            nameLast: 'Doe',
            handleStr: 'jeffdoe',
            profileImgUrl: defaultProfilePhoto
        };

        requestMessagePin(user1.token, msg2.messageId);
        // Add a react to the 2nd msg to see if the react sticks.
        expect(requestChannelMessages(user1.token, channel1.channelId, 0).messages).toStrictEqual([
            {
                message:'Message from user with uId 2',
                messageId: msg2.messageId,
                uId: user3.authUserId,
                timeSent: expect.any(Number),
                reacts:  expect.any(Array),
                isPinned: true
            },
            {
                message: 'Message from user with uId 1',
                messageId: msg1.messageId,
                uId: user2.authUserId,
                timeSent: expect.any(Number),
                reacts:  expect.any(Array),
                isPinned: false
            }
        ]);

        expect(requestchannelDetails(user1.token, channel1.channelId).allMembers).toContainEqual( userJeff );

        expect(requestAdminUserRemove(user1.token, user3.authUserId)).toStrictEqual( {} );

        expect(requestchannelDetails(user1.token, channel1.channelId).allMembers).not.toContainEqual( userJeff );

        expect(requestChannelMessages(user1.token, channel1.channelId, 0).messages).toStrictEqual([
            {
                message:'Removed user',
                messageId: msg2.messageId,
                uId: user3.authUserId,
                timeSent: expect.any(Number),
                reacts:  expect.any(Array),
                isPinned: true
            },
            {
                message: 'Message from user with uId 1',
                messageId: msg1.messageId,
                uId: user2.authUserId,
                timeSent: expect.any(Number),
                reacts:  expect.any(Array),
                isPinned: false
            }
        ]);
    });
    

    test('Correct change for dm messages', () => {
        const msg1: message = requestMessageSendDm(user2.token, dm1.dmId, 'Message from user with uId 1');
        const msg2: message = requestMessageSendDm(user3.token, dm1.dmId, 'Message from user with uId 2');

        const userBob: userShort = {
            uId: 1,
            email: 'example2@gmail.com',
            nameFirst: 'Bob',
            nameLast: 'Doe',
            handleStr: 'bobdoe',
            profileImgUrl: defaultProfilePhoto
        };

        requestMessagePin(user1.token, msg2.messageId);
        // Add a react to the 2nd msg to see if the react sticks.
        expect(requestDmMessages(user1.token, dm1.dmId, 0).messages).toStrictEqual([
            {
                message:'Message from user with uId 2',
                messageId: msg2.messageId,
                uId: user3.authUserId,
                timeSent: expect.any(Number),
                reacts:  expect.any(Array),
                isPinned: true
            },
            {
                message: 'Message from user with uId 1',
                messageId: msg1.messageId,
                uId: user2.authUserId,
                timeSent: expect.any(Number),
                reacts:  expect.any(Array),
                isPinned: false
            }
        ]);

        expect(requestDmDetails(user1.token, dm1.dmId).members).toContainEqual( userBob );

        expect(requestAdminUserRemove(user1.token, user2.authUserId)).toStrictEqual( {} );

        expect(requestDmDetails(user1.token, dm1.dmId).members).not.toContainEqual( userBob );

        expect(requestDmMessages(user1.token, dm1.dmId, 0).messages).toStrictEqual([
            {
                message:'Message from user with uId 2',
                messageId: msg2.messageId,
                uId: user3.authUserId,
                timeSent: expect.any(Number),
                reacts:  expect.any(Array),
                isPinned: true
            },
            {
                message: 'Removed user',
                messageId: msg1.messageId,
                uId: user2.authUserId,
                timeSent: expect.any(Number),
                reacts:  expect.any(Array),
                isPinned: false
            }
        ]);
    });

});