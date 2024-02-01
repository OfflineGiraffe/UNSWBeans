import { newUser, newDm } from '../dataStore';
import { defaultProfilePhoto } from '../helperFunctions';
import {
  requestClear, requestAuthRegister, requestDmCreate, requestDmDetails, requestDmLeave
} from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe('dmLeave tests', () => {
  let user0: newUser;
  let user1: newUser;
  let user2: newUser;
  let user3: newUser;
  let dm0: newDm;

  beforeEach(() => {
    requestClear();
    user0 = requestAuthRegister('example1@gmail.com', 'Abcd1234', 'Jake', 'Doe'); // uid = 0
    user1 = requestAuthRegister('example2@gmail.com', 'Abcd1234', 'John', 'Doe'); // uid = 1
    user2 = requestAuthRegister('example3@gmail.com', 'Abcd1234', 'Bob', 'Doe'); // uid = 2
    user3 = requestAuthRegister('example4@gmail.com', 'Abcd1234', 'Jeff', 'Doe'); // uid = 3
    dm0 = requestDmCreate(user0.token, [user1.authUserId, user2.authUserId]);
  });

  test('Error returns', () => {
    // invalid dmId
    expect(requestDmLeave(user0.token, 99)).toStrictEqual(400);
    // user is not a member of the DM
    expect(requestDmLeave(user3.token, dm0.dmId)).toStrictEqual(403);
    // invalid token
    expect(requestDmLeave('RandomToken', dm0.dmId)).toStrictEqual(403);
  });

  test('remove member', () => {
    expect(requestDmLeave(user1.token, dm0.dmId)).toStrictEqual({});
  });

  test('multiple users leave DM', () => {
    requestDmLeave(user1.token, dm0.dmId);
    requestDmLeave(user2.token, dm0.dmId);
    expect(requestDmDetails(user0.token, dm0.dmId)).toStrictEqual(
      {
        members: [{
          uId: 0,
          email: 'example1@gmail.com',
          nameFirst: 'Jake',
          nameLast: 'Doe',
          handleStr: 'jakedoe',
          profileImgUrl: defaultProfilePhoto
        }],
        name: 'bobdoe, jakedoe, johndoe',
      }
    );
  });

  test('Dm when owner leaves', () => {
    requestDmLeave(user0.token, dm0.dmId);
    expect(requestDmDetails(user1.token, dm0.dmId)).toStrictEqual(
      {
        members: [
          {
            uId: 1,
            email: 'example2@gmail.com',
            nameFirst: 'John',
            nameLast: 'Doe',
            handleStr: 'johndoe',
            profileImgUrl: defaultProfilePhoto
          },
          {
            uId: 2,
            email: 'example3@gmail.com',
            nameFirst: 'Bob',
            nameLast: 'Doe',
            handleStr: 'bobdoe',
            profileImgUrl: defaultProfilePhoto
          }],
        name: 'bobdoe, jakedoe, johndoe',
      }
    );
  });

  test('if user is not in dm anymore', () => {
    requestDmLeave(user0.token, dm0.dmId);
    expect(requestDmDetails(user0.token, dm0.dmId)).toStrictEqual(403);
  });
});
