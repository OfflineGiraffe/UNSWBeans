import { List, ListItem, ListItemIcon, ListItemText, ListSubheader } from '@material-ui/core';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import axios from 'axios';
import React from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../AuthContext';
import { makeRequest } from '../utils/axios_wrapper';
import { useStep } from '../utils/update';
import AddChannelDialog from './Channel/AddChannelDialog';

function ChannelList({ channelId: currChannelId }) {
  const [myChannels, setMyChannels] = React.useState([]);
  const [allChannels, setAllChannels] = React.useState([]);

  const token = React.useContext(AuthContext);

  const fetchChannelsData = () => {
    // fetch channels data
    const getMyChannels = makeRequest('GET', 'CHANNELS_LIST', { token });
    const getAllChannels = makeRequest('GET', 'CHANNELS_LISTALL', { token });

    axios.all([
      getMyChannels,
      getAllChannels,
    ]).then(axios.spread((myChannelResponse, allChannelResponse) => {
      const myChannelData = myChannelResponse.data.channels;
      const allChannelData = allChannelResponse.data.channels;
      const filteredChannels = allChannelData.filter(channel => {
        return (
            myChannelData.find(c => c.channelId === channel.channelId) === undefined
        );
      });
      setMyChannels(myChannelData);
      setAllChannels(filteredChannels);
    }));
  };

  useStep(fetchChannelsData, [], 2);

  return (
      <>
        <List
            subheader={(
                <ListSubheader style={{ display: 'flex' }}>
                  <span style={{ flex: 1 }}>My Channels</span>
                  <AddChannelDialog callback={fetchChannelsData}/>
                </ListSubheader>
            )}
        >
          {myChannels.map(({ channelId, name }, index) => (
              <ListItem button key={channelId} component={Link} to={`/channel/${channelId}`}>
                <ListItemIcon>
                  {channelId == currChannelId
                      ? <RadioButtonCheckedIcon/>
                      : <RadioButtonUncheckedIcon/>}
                </ListItemIcon>
                <ListItemText primary={name}/>
              </ListItem>
          ))}
        </List>
        <List subheader={<ListSubheader>Other Channels</ListSubheader>}>
          {allChannels.map(({ channelId, name }, index) => (
              <ListItem button key={channelId} component={Link} to={`/channel/${channelId}`}>
                <ListItemIcon>
                  {channelId == currChannelId
                      ? <RadioButtonCheckedIcon/>
                      : <RadioButtonUncheckedIcon/>}
                </ListItemIcon>
                <ListItemText primary={name}/>
              </ListItem>
          ))}
        </List>
      </>
  );
}

export default ChannelList;
