import { newUser } from '../dataStore';
import { defaultProfilePhoto } from '../helperFunctions';
import { requestClear, requestAuthRegister, requestUserProfile, requestUserProfilePhotoUpload } from '../wrapperFunctions';

requestClear();
let user1: newUser;
let url: string

beforeEach(() => {
  requestClear();

  user1 = requestAuthRegister('example@gmail.com', 'ABCD1234', 'Bob', 'Doe');

  url = 'http://www.learningcontainer.com/wp-content/uploads/2020/07/Sample-JPEG-Image-File-Download-scaled.jpg';
});

afterEach(() => {
  requestClear();
});

describe('Error Testing', () => {

    test('// invalid url/ not correct this one returns a 404', () => {

        expect(requestUserProfilePhotoUpload(user1.token, 'http://filesamples.com/samples/image/jpeg/sample_640x426.jpeg', 0, 0, 100, 100))
        .resolves.toStrictEqual(400);

    });

    test('start/end points are outside the image', () => {
    
        expect(requestUserProfilePhotoUpload(user1.token, url, 0, 0, 3024, 1024)).resolves.toStrictEqual(400);
    });

    test('start/end points are outside the image', () => {
    
        expect(requestUserProfilePhotoUpload(user1.token, url, -30, 0, 1024, 1024)).resolves.toStrictEqual(400);
    });

    test('xEnd is less than xStart', () => {
    
        expect(requestUserProfilePhotoUpload(user1.token, url, 50, 0, 10, 800)).resolves.toStrictEqual(400);
    });

    test('yEnd is less than yStart', () => {
    
        expect(requestUserProfilePhotoUpload(user1.token, url, 0, 50, 800, 10)).resolves.toStrictEqual(400);
    });

    test('image is not a .jpg', () => {
       
        expect(requestUserProfilePhotoUpload(user1.token, 'http://i.imgur.com/18C0q35.png', 0, 0, 1024, 1024)).resolves.toStrictEqual(400);
    });
    
    test('invalid user', () => {
       
        expect(requestUserProfilePhotoUpload('abcde', url, 0, 0, 1024, 1024)).resolves.toStrictEqual(403);
    });

});

let user2: newUser;
describe('Succesful Upload', () => {
    test('Example 1', () => {
        expect(requestUserProfile(user1.token, user1.authUserId).user.profileImgUrl).toStrictEqual(defaultProfilePhoto);

        expect(requestUserProfilePhotoUpload(user1.token, url, 1200, 0, 2560, 1920)).resolves.toStrictEqual( {} );

        expect(requestUserProfile(user1.token, user1.authUserId).user.profileImgUrl).not.toBe(defaultProfilePhoto);
    })

    // If time is too long get rid of this test.
    test('Example 2', () => {
        user2 = requestAuthRegister('example2@gmail.com', 'ABCD1234', 'John', 'Doe');

        expect(requestUserProfile(user1.token, user2.authUserId).user.profileImgUrl).toStrictEqual(defaultProfilePhoto);

        expect(requestUserProfilePhotoUpload(user2.token, url, 200, 200, 580, 480)).resolves.toStrictEqual( {} );

        expect(requestUserProfile(user1.token, user2.authUserId).user.profileImgUrl).not.toBe(defaultProfilePhoto);
    })
})