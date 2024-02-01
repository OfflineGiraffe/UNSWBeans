import { newUser, newChannel, newDm, message } from '../dataStore';
import {
  requestClear, requestAuthRegister, requestChannelsCreate, requestAdminUserRemove, requestChannelJoin, requestUsersAll, requestUserProfile, requestDmCreate,
  requestMessageSend, requestChannelMessages, requestMessageSendDm, requestDmMessages, requestMessagePin, requestchannelDetails, requestDmDetails, requestAddOwner, requestRemoveOwner,
  requestAdminUserpermissionChange
} from '../wrapperFunctions';

requestClear();

afterEach(() => {
    requestClear();
})

describe('adminpermission change test', () => {
    let user0: newUser;
    let user1: newUser;
    let user2: newUser;

    let channel0: newChannel;
    let channel1: newChannel;

    beforeEach(() => {
        requestClear();

        user0 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'Bob', 'Doe');
        user1 = requestAuthRegister('example2@gmail.com', 'ABCD1234', 'John', 'Doe');
        user2 = requestAuthRegister('example3@gmail.com', 'ABCD1234', 'Jeff', 'Doe');

        channel0 = requestChannelsCreate(user0.token, 'channel1', true);
        channel1 = requestChannelsCreate(user1.token, 'channel2', true);
    });

    test ('error returns', () => {
        requestChannelJoin(user1.token, channel0.channelId);

        // uid is not a valid user
        expect(requestAdminUserpermissionChange(user0.token, 99, 1)).toStrictEqual(400);
        //only global owner
        expect(requestAdminUserpermissionChange(user0.token, user0.authUserId, 2)).toStrictEqual(400);
        //invalid permissionId
        expect(requestAdminUserpermissionChange(user0.token, user1.authUserId, 99)).toStrictEqual(400);

        //user already has same permission level
        requestAdminUserpermissionChange(user0.token, user1.authUserId, 1);
        expect(requestAdminUserpermissionChange(user0.token, user1.authUserId, 1)).toStrictEqual(400);

        //invalid token
        expect(requestAdminUserpermissionChange('INVALID TOKEN', user0.authUserId, 1)).toStrictEqual(403)
        //not a global owner
        expect(requestAdminUserpermissionChange(user2.token, user1.authUserId, 1)).toStrictEqual(403);
    });

    test('correct return', () => {
        expect(requestAdminUserpermissionChange(user0.token, user1.authUserId, 1)).toStrictEqual({});
    });

    //removed global owner tries to change permission
    test('Example Correct Return', () => {
        requestChannelJoin(user0.token, channel1.channelId);
        requestChannelJoin(user2.token, channel1.channelId);

        // User 2 is a normal member of the channel, with normal global permissions
        expect(requestAddOwner(user2.token, channel1.channelId, user0.authUserId)).toThrowError;

        // user 2 now has global permissions
        expect(requestAdminUserpermissionChange(user0.token, user2.authUserId, 1)).toStrictEqual({});

        // Since user 2 has global permissions they have same permissions as a channel owner, and can thus add a owner.
        expect(requestAddOwner(user2.token, channel1.channelId, user0.authUserId)).not.toThrowError;

    });

    //global owner changing channel owners permission
    test('correct return', () => {
        requestChannelJoin(user0.token, channel1.channelId);
        requestRemoveOwner(user0.token, channel1.channelId, user1.authUserId);
    });

    //adding new owner who can change permission of other owners
    test('correct return', () => {
        // User 0 promoting user 2 to global owner
        expect(requestAdminUserpermissionChange(user0.token, user2.authUserId, 1)).toStrictEqual({});

        // Since user 2 is now a global owner they can demote user0 to be a normal owner
        expect(requestAdminUserpermissionChange(user2.token, user0.authUserId, 2)).toStrictEqual({});

    });
})