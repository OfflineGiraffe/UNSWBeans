import { newUser, newChannel, newDm } from '../dataStore';

import {
  requestClear, requestAuthRegister, requestChannelsCreate, requestMessageSend, requestNotificationsGet, requestChannelJoin, requestDmCreate, requestChannelInvite, requestMessageSendDm, requestMessageReact
} from '../wrapperFunctions';

requestClear();

  let user0: newUser;
  let user1: newUser;
  let channel0: newChannel;

beforeEach(() => {
    requestClear();
    user0 = requestAuthRegister('example0@gmail.com', 'ABCD1234', 'Jeff', 'Doe'); // uid = 0
    user1 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'John', 'Doe'); // uid = 1

    channel0 = requestChannelsCreate(user0.token, 'Channel1', true);
});

describe(('Notification Get Base tests'), () => {
    test('Bad token', () => {
        expect(requestNotificationsGet('abcde')).toStrictEqual(403);
    });

    test('Good token', () => {
        expect(requestNotificationsGet(user0.token).notifications).toStrictEqual([]);
    })

});

describe(('Notification Get Correct Return in channel'), () => {
    test('Example 1', () => {
        requestChannelInvite(user0.token, channel0.channelId, user1.authUserId);

        expect(requestNotificationsGet(user1.token).notifications).toStrictEqual([{
            channelId: channel0.channelId,
            dmId: -1,
            notificationMessage: "jeffdoe added you to Channel1"
        }]);

        requestMessageSend(user0.token, channel0.channelId, "@jeffdoe Hello @johndoe");

        expect(requestNotificationsGet(user0.token).notifications).toStrictEqual([{
            channelId: channel0.channelId,
            dmId: -1,
            notificationMessage: "jeffdoe tagged you in Channel1: @jeffdoe Hello @john"
        }]);

        expect(requestNotificationsGet(user1.token).notifications).toStrictEqual([{
            channelId: channel0.channelId,
            dmId: -1,
            notificationMessage: "jeffdoe tagged you in Channel1: @jeffdoe Hello @john"
        },
        {
            channelId: channel0.channelId,
            dmId: -1,
            notificationMessage: "jeffdoe added you to Channel1"
        }]);
    })

});

describe(('Notification Get Correct Return in dm'), () => {
    test('Example', () => {
        const dm: newDm = requestDmCreate(user0.token, [user1.authUserId]);

        expect(requestNotificationsGet(user1.token).notifications).toStrictEqual([{
            channelId: -1,
            dmId: dm.dmId,
            notificationMessage: "jeffdoe added you to jeffdoe, johndoe"
        }]);

        const msg = requestMessageSendDm(user1.token, dm.dmId, "@jeffdoe Hello");

        requestMessageReact(user0.token, msg.messageId, 1);

        expect(requestNotificationsGet(user0.token).notifications).toStrictEqual([{
            channelId: -1,
            dmId: dm.dmId,
            notificationMessage: "johndoe tagged you in jeffdoe, johndoe: @jeffdoe Hello"
        }]);

        expect(requestNotificationsGet(user1.token).notifications).toStrictEqual([{
            channelId: -1,
            dmId: dm.dmId,
            notificationMessage: "jeffdoe reacted to your message in jeffdoe, johndoe"
        },
        {
            channelId: -1,
            dmId: dm.dmId,
            notificationMessage: "jeffdoe added you to jeffdoe, johndoe"
        }]);
    })

});