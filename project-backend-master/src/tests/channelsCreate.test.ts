import { requestClear, requestAuthRegister, requestChannelsCreate, requestchannelDetails } from '../wrapperFunctions';
import { defaultProfilePhoto } from '../helperFunctions';
import { newUser } from '../dataStore';

requestClear();

afterEach(() => {
  requestClear();
});

describe('channelsCreate tests', () => {
  let user: newUser;

  beforeEach(() => {
    requestClear();
    user = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'John', 'Doe');
  });

  test('Error Returns', () => {
    expect(requestChannelsCreate(user.token, '', true)).toEqual(400);
    expect(requestChannelsCreate(user.token, 'Thisisaverylongchannelname', true)).toEqual(400);
    expect(requestChannelsCreate('abc', 'Channel1', true)).toEqual(403);
  });

  test('Correct Return', () => {
    const channelCreated = requestChannelsCreate(user.token, 'Channel1', true) as { channelId: number };
    expect(channelCreated).toStrictEqual({ channelId: expect.any(Number) });

    expect(requestchannelDetails(user.token, channelCreated.channelId)).toStrictEqual({
      name: 'Channel1',
      isPublic: true,
      ownerMembers: [
        {
          uId: user.authUserId,
          email: 'example1@gmail.com',
          nameFirst: 'John',
          nameLast: 'Doe',
          handleStr: 'johndoe',
          profileImgUrl: defaultProfilePhoto
        },
      ],
      allMembers: [
        {
          uId: user.authUserId,
          email: 'example1@gmail.com',
          nameFirst: 'John',
          nameLast: 'Doe',
          handleStr: 'johndoe',
          profileImgUrl: defaultProfilePhoto
        },
      ]
    });
  });
});
