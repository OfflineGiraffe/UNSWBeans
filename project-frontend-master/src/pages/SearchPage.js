import React from 'react';
import Layout from '../components/Layout';
import ProfileChannelLists from '../components/ProfileChannelLists';
import Search from '../components/Search';

function SearchPage({ match }) {
  const { queryStr = '' } = match.params;
  return <Layout menu={<ProfileChannelLists/>} body={<Search queryStr={queryStr}/>}/>;
}

export default SearchPage;
