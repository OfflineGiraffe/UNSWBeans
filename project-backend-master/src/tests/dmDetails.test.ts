import { newUser, dmType } from '../dataStore';
import { defaultProfilePhoto } from '../helperFunctions';
import {
  requestClear, requestAuthRegister, requestDmCreate, requestDmDetails
} from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe('Dm details tests', () => {
  let user0: newUser;
  let user1: newUser;
  let user2: newUser;
  let dm0: dmType;

  const memberCheck = [
    {
      email: 'example1@gmail.com',
      handleStr: 'johndoe',
      nameFirst: 'John',
      nameLast: 'Doe',
      uId: 0,
      profileImgUrl: defaultProfilePhoto
    },
    {
      email: 'example2@gmail.com',
      handleStr: 'bobdoe',
      nameFirst: 'Bob',
      nameLast: 'Doe',
      uId: 1,
      profileImgUrl: defaultProfilePhoto
    }
  ];

  beforeEach(() => {
    requestClear();
    user0 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'John', 'Doe'); // uid = 0
    user1 = requestAuthRegister('example2@gmail.com', 'ABCD1234', 'Bob', 'Doe'); // uid = 1
    user2 = requestAuthRegister('example0@gmail.com', 'ABCD1234', 'Jeff', 'Doe'); // uid = 2
    dm0 = requestDmCreate(user0.token, [user1.authUserId]);
  });

  test('Error (Invalid token)', () => {
    expect(requestDmDetails('invalid Token', dm0.dmId)).toStrictEqual(403);
  });

  test('Error (Invalid dmId)', () => {
    expect(requestDmDetails(user0.token, 67)).toStrictEqual(400);
  });

  test('Error (user is not member of DM)', () => {
    expect(requestDmDetails(user2.token, dm0.dmId)).toStrictEqual(403);
  });

  test('Successful return', () => {
    expect(requestDmDetails(user1.token, dm0.dmId)).toStrictEqual({ name: 'bobdoe, johndoe', members: memberCheck });
  });
});
