import React from 'react';
import Channel from '../components/Channel';
import Layout from '../components/Layout';
import ProfileChannelLists from '../components/ProfileChannelLists';

function ChannelPage({ match }) {
  const { channelId } = match.params;
  return (
      <Layout
          menu={<ProfileChannelLists channelId={channelId} dmId={null}/>}
          body={<Channel channelId={channelId}/>}
      />
  );
}

export default ChannelPage;
