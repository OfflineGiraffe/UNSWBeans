import exp from 'constants';
import { newUser, newChannel, dmType, userShort } from '../dataStore';

import {
  requestClear, requestAuthRegister, requestChannelsCreate, requestChannelJoin,
  requestDmCreate, requestUserStatsV1, requestMessageSend, requestMessageSendDm, requestChannelLeave, requestDmRemove, requestDmLeave,
  requestMessageShare,
} from '../wrapperFunctions';

requestClear();

afterEach(() => {
  requestClear();
});

describe("User Stats Tests", () => {
    let user0: newUser;
    let user1: newUser;
    let channel0: newChannel;
    let dm0: dmType;

    beforeEach(() => {
        requestClear();
        user0 = requestAuthRegister('example0@gmail.com', 'ABCD1234', 'Jeff', 'Doe'); // uid = 0
        user1 = requestAuthRegister('example1@gmail.com', 'ABCD1234', 'John', 'Doe'); // uid = 1

        channel0 = requestChannelsCreate(user0.token, 'Channel1', true);
        dm0 = requestDmCreate(user0.token, [user1.authUserId]);
    });

    test("Errors", () => {
        expect(requestUserStatsV1("Random Token")).toStrictEqual(403);
    })

    test("Correct output in just channels", () => {
        requestMessageSend(user0.token, channel0.channelId, 'THE FIRST MESSAGE BY OWNER');
        expect(requestUserStatsV1(user0.token).userStats).toStrictEqual(
            {
            channelsJoined: [{
                numChannelsJoined: 0,
                timeStamp: expect.any(Number)
            }, 
            {
                numChannelsJoined: 1,
                timeStamp: expect.any(Number)
            },
        ],
            dmsJoined: [{
                numDmsJoined: 0,
                timeStamp: expect.any(Number)
            },
            {
                numDmsJoined: 1,
                timeStamp: expect.any(Number)
            }
        ],
            messagesSent: [{
                numMessagesSent: 0,
                timeStamp: expect.any(Number)
            },
            {
                numMessagesSent: 1,
                timeStamp: expect.any(Number)
            }
        ],
            involvementRate: expect.any(Number)    
        });

        expect(requestUserStatsV1(user1.token).userStats).toStrictEqual(
            {
                channelsJoined: [{
                    numChannelsJoined: 0,
                    timeStamp: expect.any(Number)
                }, 
            ],
                dmsJoined: [{
                    numDmsJoined: 0,
                    timeStamp: expect.any(Number)
                },
                {
                    numDmsJoined: 1,
                    timeStamp: expect.any(Number)
                }
            ],
                messagesSent: [{
                    numMessagesSent: 0,
                    timeStamp: expect.any(Number)
                },
            ],
                involvementRate: expect.any(Number)    
            });
    }) 

    test("Correct output for leaving channel", () => {
        requestChannelJoin(user1.token, channel0.channelId);
        requestMessageSend(user0.token, channel0.channelId, 'THE FIRST MESSAGE BY OWNER');
        requestChannelLeave(user0.token, channel0.channelId);
        expect(requestUserStatsV1(user0.token).userStats).toStrictEqual(
            {
                channelsJoined: [{
                    numChannelsJoined: 0,
                    timeStamp: expect.any(Number)
                }, 
                {
                    numChannelsJoined: 1,
                    timeStamp: expect.any(Number)
                },
                {
                    numChannelsJoined: 0,
                    timeStamp: expect.any(Number)
                },
            ],
                dmsJoined: [{
                    numDmsJoined: 0,
                    timeStamp: expect.any(Number)
                },
                {
                    numDmsJoined: 1,
                    timeStamp: expect.any(Number)
                }
            ],
                messagesSent: [{
                    numMessagesSent: 0,
                    timeStamp: expect.any(Number)
                },
                {
                    numMessagesSent: 1,
                    timeStamp: expect.any(Number)
                }
            ],
                involvementRate: expect.any(Number)    
            });
    }) 

    test("Correct output for messages in dm", () => {
        requestMessageSendDm(user0.token, dm0.dmId, 'THE FIRST MESSAGE BY OWNER IN DM');
        requestMessageSendDm(user1.token, dm0.dmId, 'THE SECOND MESSAGE BY OWNER IN DM');
        requestMessageSendDm(user0.token, dm0.dmId, 'THE THIRD MESSAGE BY OWNER IN DM');
        expect(requestUserStatsV1(user0.token).userStats).toStrictEqual(
            {
                channelsJoined: [{
                    numChannelsJoined: 0,
                    timeStamp: expect.any(Number)
                }, 
                {
                    numChannelsJoined: 1,
                    timeStamp: expect.any(Number)
                },
            ],
                dmsJoined: [{
                    numDmsJoined: 0,
                    timeStamp: expect.any(Number)
                },
                {
                    numDmsJoined: 1,
                    timeStamp: expect.any(Number)
                }
            ],
                messagesSent: [{
                    numMessagesSent: 0,
                    timeStamp: expect.any(Number)
                },
                {
                    numMessagesSent: 1,
                    timeStamp: expect.any(Number)
                },
                {
                    numMessagesSent: 2,
                    timeStamp: expect.any(Number)
                }
            ],
                involvementRate: expect.any(Number)    
            });

        expect(requestUserStatsV1(user1.token).userStats).toStrictEqual(
            {
                channelsJoined: [{
                    numChannelsJoined: 0,
                    timeStamp: expect.any(Number)
                }, 
            ],
                dmsJoined: [{
                    numDmsJoined: 0,
                    timeStamp: expect.any(Number)
                },
                {
                    numDmsJoined: 1,
                    timeStamp: expect.any(Number)
                }
            ],
                messagesSent: [{
                    numMessagesSent: 0,
                    timeStamp: expect.any(Number)
                },
                {
                    numMessagesSent: 1,
                    timeStamp: expect.any(Number)
                }
            ],
                involvementRate: expect.any(Number)    
            });
    }) 

    test("Correct output for messages in dm and channel", () => {
        requestMessageSendDm(user0.token, dm0.dmId, 'THE FIRST MESSAGE BY OWNER IN DM');
        requestMessageSendDm(user1.token, dm0.dmId, 'THE SECOND MESSAGE BY OWNER IN DM');
        requestMessageSendDm(user0.token, dm0.dmId, 'THE THIRD MESSAGE BY OWNER IN DM');
        requestMessageSend(user0.token, channel0.channelId, 'THE FIRST MESSAGE BY OWNER IN CHANNEL');
        requestMessageSend(user1.token, channel0.channelId, 'THE SECOND MESSAGE BY OWNER IN CHANNEL');


        expect(requestUserStatsV1(user0.token).userStats).toStrictEqual(
            {
                channelsJoined: [{
                    numChannelsJoined: 0,
                    timeStamp: expect.any(Number)
                }, 
                {
                    numChannelsJoined: 1,
                    timeStamp: expect.any(Number)  
                }
            ],
                dmsJoined: [{
                    numDmsJoined: 0,
                    timeStamp: expect.any(Number)
                },
                {
                    numDmsJoined: 1,
                    timeStamp: expect.any(Number)
                }
            ],
                messagesSent: [{
                    numMessagesSent: 0,
                    timeStamp: expect.any(Number)
                },
                {
                    numMessagesSent: 1,
                    timeStamp: expect.any(Number)
                },
                {
                    numMessagesSent: 2,
                    timeStamp: expect.any(Number)
                }, 
                {
                    numMessagesSent: 3,
                    timeStamp: expect.any(Number)
                }
            ],
                involvementRate: expect.any(Number)    
            });

        expect(requestUserStatsV1(user1.token).userStats).toStrictEqual({
            channelsJoined: [{
                numChannelsJoined: 0,
                timeStamp: expect.any(Number)
            }],
            dmsJoined: [{
                numDmsJoined: 0,
                timeStamp: expect.any(Number)
            },
            {
                numDmsJoined: 1,
                timeStamp: expect.any(Number)
            }
        ],
            messagesSent: [{
                numMessagesSent: 0,
                timeStamp: expect.any(Number)
            },
            {
                numMessagesSent: 1,
                timeStamp: expect.any(Number)
            },
        ],
            involvementRate: expect.any(Number)      
        });
    })

    test("Correct output for removing dms", () => {
        requestMessageSendDm(user0.token, dm0.dmId, 'THE FIRST MESSAGE BY OWNER IN THE DMMSS');
        requestDmRemove(user0.token, dm0.dmId);
        expect(requestUserStatsV1(user0.token).userStats).toStrictEqual(
            {
                channelsJoined: [{
                    numChannelsJoined: 0,
                    timeStamp: expect.any(Number)
                }, 
                {
                    numChannelsJoined: 1,
                    timeStamp: expect.any(Number)
                },
            ],
                dmsJoined: [{
                    numDmsJoined: 0,
                    timeStamp: expect.any(Number)
                },
                {
                    numDmsJoined: 1,
                    timeStamp: expect.any(Number)
                },
                {
                    numDmsJoined: 0,
                    timeStamp: expect.any(Number)
                }
            ],
                messagesSent: [{
                    numMessagesSent: 0,
                    timeStamp: expect.any(Number)
                },
                {
                    numMessagesSent: 1,
                    timeStamp: expect.any(Number)
                }
            ],
                involvementRate: expect.any(Number)    
            });

            expect(requestUserStatsV1(user1.token).userStats).toStrictEqual(
                {
                    channelsJoined: [{
                        numChannelsJoined: 0,
                        timeStamp: expect.any(Number)
                    }, 
                ],
                    dmsJoined: [{
                        numDmsJoined: 0,
                        timeStamp: expect.any(Number)
                    },
                    {
                        numDmsJoined: 1,
                        timeStamp: expect.any(Number)
                    },
                    {
                        numDmsJoined: 0,
                        timeStamp: expect.any(Number)
                    }
                ],
                    messagesSent: [{
                        numMessagesSent: 0,
                        timeStamp: expect.any(Number)
                    },
                ],
                    involvementRate: expect.any(Number)    
                });
    }) 

    test("Correct output for leaving dms", () => {
        requestMessageSendDm(user1.token, dm0.dmId, 'THE FIRST MESSAGE BY NOT AN OWNER IN THE DMMSS');
        requestDmLeave(user1.token, dm0.dmId);
        expect(requestUserStatsV1(user1.token).userStats).toStrictEqual(
            {
                channelsJoined: [{
                    numChannelsJoined: 0,
                    timeStamp: expect.any(Number)
                }, 
            ],
                dmsJoined: [{
                    numDmsJoined: 0,
                    timeStamp: expect.any(Number)
                },
                {
                    numDmsJoined: 1,
                    timeStamp: expect.any(Number)
                },
                {
                    numDmsJoined: 0,
                    timeStamp: expect.any(Number)
                }
            ],
                messagesSent: [{
                    numMessagesSent: 0,
                    timeStamp: expect.any(Number)
                },
                {
                    numMessagesSent: 1,
                    timeStamp: expect.any(Number)
                }
            ],
                involvementRate: expect.any(Number)    
            });

            expect(requestUserStatsV1(user0.token).userStats).toStrictEqual(
                {
                    channelsJoined: [{
                        numChannelsJoined: 0,
                        timeStamp: expect.any(Number)
                    }, 
                    {
                        numChannelsJoined: 1,
                        timeStamp: expect.any(Number)
                    }, 
                ],
                    dmsJoined: [{
                        numDmsJoined: 0,
                        timeStamp: expect.any(Number)
                    },
                    {
                        numDmsJoined: 1,
                        timeStamp: expect.any(Number)
                    },
                ],
                    messagesSent: [{
                        numMessagesSent: 0,
                        timeStamp: expect.any(Number)
                    },
                ],
                    involvementRate: expect.any(Number)    
                });
    }) 

    test("Correct output for multiple messages", () => {
        const msg1 = requestMessageSend(user0.token, channel0.channelId, 'THE FIRST MESSAGE BY OWNER');
        const msg2 = requestMessageSendDm(user0.token, dm0.dmId, "ANOTHER MESSAGE");
        requestMessageSend(user0.token, channel0.channelId, 'THE Second MESSAGE BY OWNER');
        requestMessageSendDm(user0.token, dm0.dmId, "ANOTHER ANOTHER MESSAGE");
        requestMessageShare(user0.token, msg1.messageId, 'Shared', channel0.channelId, -1)
        requestMessageShare(user0.token, msg2.messageId, 'Shared', -1, dm0.dmId)
        expect(requestUserStatsV1(user0.token).userStats).toStrictEqual(
            {
                channelsJoined: [{
                    numChannelsJoined: 0,
                    timeStamp: expect.any(Number)
                }, 
                {
                    numChannelsJoined: 1,
                    timeStamp: expect.any(Number)
                },
            ],
                dmsJoined: [{
                    numDmsJoined: 0,
                    timeStamp: expect.any(Number)
                },
                {
                    numDmsJoined: 1,
                    timeStamp: expect.any(Number)
                }
            ],
                messagesSent: [{
                    numMessagesSent: 0,
                    timeStamp: expect.any(Number)
                },
                {
                    numMessagesSent: 1,
                    timeStamp: expect.any(Number)
                },
                {
                    numMessagesSent: 2,
                    timeStamp: expect.any(Number)
                },
                {
                    numMessagesSent: 3,
                    timeStamp: expect.any(Number)
                },
                {
                    numMessagesSent: 4,
                    timeStamp: expect.any(Number)
                },
                {
                    numMessagesSent: 5,
                    timeStamp: expect.any(Number)
                },
                {
                    numMessagesSent: 6,
                    timeStamp: expect.any(Number)
                }
            ],
                involvementRate: expect.any(Number)    
            });
    }) 

    test("Correct output for multiple messages", () => {
        let user2: newUser = requestAuthRegister('example2@gmail.com', 'ABCD1234', 'John', 'Doe'); // uid = 1
        requestMessageSend(user0.token, channel0.channelId, 'THE FIRST MESSAGE BY OWNER');
        requestMessageSendDm(user0.token, dm0.dmId, "ANOTHER MESSAGE");
        requestMessageSend(user0.token, channel0.channelId, 'THE FIRST MESSAGE BY OWNER');
        requestMessageSendDm(user0.token, dm0.dmId, "ANOTHER MESSAGE");
        requestMessageSend(user0.token, channel0.channelId, 'THE Second MESSAGE BY OWNER');
        requestMessageSendDm(user0.token, dm0.dmId, "ANOTHER ANOTHER MESSAGE");
        requestMessageSend(user0.token, channel0.channelId, 'THE ASIDHNOE MESSAGE BY OWNER');
        requestMessageSendDm(user0.token, dm0.dmId, "ANOTHASDASDER MESSAGE");
        requestMessageSend(user0.token, channel0.channelId, 'THE Second MESSAGE BY OWNER');
        requestMessageSendDm(user0.token, dm0.dmId, "ASDASDASD ANOTHER MESSAGE");
        expect(requestUserStatsV1(user2.token).userStats).toStrictEqual(
            {
                channelsJoined: [{
                    numChannelsJoined: 0,
                    timeStamp: expect.any(Number)
                }, 
            ],
                dmsJoined: [{
                    numDmsJoined: 0,
                    timeStamp: expect.any(Number)
                },
            ],
                messagesSent: [{
                    numMessagesSent: 0,
                    timeStamp: expect.any(Number)
                },
            ],
                involvementRate: expect.any(Number)    
            });
    }) 

})