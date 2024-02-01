import React from 'react';
import Layout from '../components/Layout';
import Profile from '../components/Profile';
import ProfileChannelLists from '../components/ProfileChannelLists';

function ProfilePage({ match }) {
  const { profile } = match.params;
  return <Layout menu={<ProfileChannelLists/>} body={<Profile profile={profile}/>}/>;
}

export default ProfilePage;
