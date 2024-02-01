```javascript
let data = {
    // Iteration 0 ideas for what data to store for users and channels. 

    user = {
        userId: 'integer' // 1
        first_name: 'string' // John
        last_name: 'string' // Doe
        email: 'string' // z555555@ad.unsw.edu.au
        phone_no: 'integer' // 0455555555
        username: 'string' // John_D
        password: 'string' // abcd1234
        user_status: 'string' // Online, Busy, Do Not Disturb, Offline
    }

    channels = {
        channelId: 'integer' // 1
        private: 'boolean' // true or false 
        channel_name: 'string' // General
        member_count: 'integer' // 10
        messageId: 'integer' // 123
        message_contents: 'string' // First message in this new channel 
        timestamp: 'date' // 2022-09-22 7:18:34
        users: ['user'] // John_D, other users...
        member_roles: 'string' // Owner, Admin, Moderator, General
    }
}
```

[Optional] short description: 