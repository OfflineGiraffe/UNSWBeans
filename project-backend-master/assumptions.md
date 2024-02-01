* = Mark these assumptions


authRegisterV1
* Passwords can be max 32 characters
* Passwords can contain only printable ASCII characters

channelListAllV1
* If there are no created channels the function will return an empty array
* The channels array will be descending order, such that the oldest channel will appear at the top of the array and the most recent channel created will appear at the bottom.

channelsCreateV1
* The user which created the channel is added as both a 'owner' and 'member', meaning they exist in both the ownerMembers and allMembers arrays inside the channel object.

channelMessages
* The more recent the message, the higher its unique 'messageId'.

channelDetailsV1
- the return output, if correct, always has the user in all members for the channel.

dataStore
- Data is stored as an object containing an array of users and channels. 

Userprofilev1
- For a given valid uId, it will return their user if the original user is also valid


ClearV1
- After running the function the 'cleared' data is just an empty array of users and channels
- If the data structure differs to the one assumed in dataStore, the clear function should reset it to an empty array of users and channels and not include the additional objects. 




