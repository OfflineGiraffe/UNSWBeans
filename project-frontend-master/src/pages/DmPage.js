import React from 'react';
import Dm from '../components/Dm';
import Layout from '../components/Layout';
import ProfileChannelLists from '../components/ProfileChannelLists';

function DmPage({ match }) {
  const { dmId } = match.params;
  return (
      <Layout menu={<ProfileChannelLists channelId={null} dmId={dmId}/>} body={<Dm dmId={dmId}/>}/>
  );
}

export default DmPage;
