import React from 'react';
import ChannelList from './ChannelList';
import DmList from './DmList';
import ProfileList from './ProfileList';

function ProfileChannelLists({ channelId, dmId }) {
  return (
      <>
        <ProfileList/>
        <ChannelList channelId={channelId}/>
        <DmList dmId={dmId}/>
      </>
  );
}

export default ProfileChannelLists;
