import {
  Avatar,
  Button,
  Grid,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  Typography,
} from '@material-ui/core';
import PersonAdd from '@material-ui/icons/PersonAdd';
import PersonAddDisabled from '@material-ui/icons/PersonAddDisabled';
import { makeRequest } from '../../utils/axios_wrapper';
import React from 'react';
import AuthContext from '../../AuthContext';
import { isMatchingId } from '../../utils';
import { extractUId } from '../../utils/token';
import { useStep } from '../../utils/update';
import Placeholder from '../Placeholder';
import AddMemberDialog from './AddMemberDialog';
import ChannelMessages from './ChannelMessages';

function Channel({ channelId, ...props }) {
  const [loading, setLoading] = React.useState(true);
  const [name, setName] = React.useState('');
  const [members, setMembers] = React.useState([]);
  const [owners, setOwners] = React.useState([]);
  const token = React.useContext(AuthContext);
  const uId = extractUId(token);

  function fetchChannelData() {
    makeRequest('GET', 'CHANNEL_DETAILS', {
      token,
      channelId,
    }).then(({ data }) => {
      const { name, ownerMembers, allMembers } = data;
      // assumes members of form [{ uId, nameFirst, nameLast }]
      setMembers(allMembers);
      setOwners(ownerMembers);
      setName(name);
    })
        .catch(err => {
          console.log(err);
          setMembers([]);
          setOwners([]);
          setName('');
        })
        .finally(() => setLoading(false));
  }

  useStep(fetchChannelData, [channelId, token], 2);

  function joinChannel(channelId, token) {
    makeRequest('POST', 'CHANNEL_JOIN', { token, channelId: Number.parseInt(channelId) })
        .then(() => {
          fetchChannelData(channelId, token);
        })
        .catch(err => console.log(err));
  }

  function leaveChannel(channelId, token) {
    makeRequest('POST', 'CHANNEL_LEAVE', { token, channelId: Number.parseInt(channelId) })
        .then(() => {
          fetchChannelData(channelId, token);
        })
        .catch(err => console.log(err));
  }

  function addOwner(uId) {
    makeRequest('POST', 'CHANNEL_ADDOWNER', { token, channelId: Number.parseInt(channelId), uId })
        .then(() => {
          fetchChannelData(channelId, token);
        })
        .catch(err => console.log(err));
  }

  function removeOwner(uId) {
    makeRequest('POST', 'CHANNEL_REMOVEOWNER', { token, channelId: Number.parseInt(channelId), uId })
        .then(() => {
          fetchChannelData(channelId, token);
        })
        .catch(err => console.log(err));
  }

  function userIsMember(members) {
    return members.find(member => isMatchingId(member.uId, uId)) !== undefined;
  }

  function userIsOwner(owners, uId) {
    return owners.find(owner => isMatchingId(owner.uId, uId)) !== undefined;
  }

  const viewerIsMember = userIsMember(members);

  return (
      <>
        {loading ? <Placeholder/> : (
            <>
              <Typography variant="h4">{name.toUpperCase()}</Typography>
              <List subheader={<ListSubheader>Members</ListSubheader>}>
                {members.map(({ uId, nameFirst, nameLast, profileImgUrl }) => (
                    <ListItem key={uId}>
                      <ListItemAvatar>
                        <Avatar
                            style={{
                              width: '50px',
                              height: '50px',
                              border: '1px solid #ccc',
                            }}
                            src={profileImgUrl}
                        >
                          {[nameFirst, nameLast]
                              .filter(s => s != null && s !== '')
                              .map(s =>
                                  s[0],
                              )
                              .join('')}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                          primary={(
                              <>
                                <Grid container alignItems="center" spacing={1}>
                                  <Grid item>
                                    <Link href={`/profile/${uId}`}>
                                      {`${nameFirst} ${nameLast}`}
                                    </Link>
                                    {`${userIsOwner(owners, uId) ? ' ⭐' : ' '}`}
                                  </Grid>
                                  <Grid item>
                                    {userIsOwner(owners, uId)
                                        ? (
                                            <IconButton
                                                size="small"
                                                onClick={() => removeOwner(uId)}
                                            >
                                              <PersonAddDisabled/>
                                            </IconButton>
                                        )
                                        : (
                                            <IconButton
                                                size="small"
                                                onClick={() => addOwner(uId)}
                                            >
                                              <PersonAdd/>
                                            </IconButton>
                                        )}
                                  </Grid>
                                </Grid>
                              </>
                          )}
                      />
                    </ListItem>
                ))}
                <ListItem key="invite_member">
                  {userIsMember(members)
                      ? (
                          <Grid container spacing={1}>
                            <Grid item>
                              <AddMemberDialog channelId={channelId}/>
                            </Grid>
                            <Grid item>
                              <Button
                                  variant="outlined"
                                  onClick={() => leaveChannel(channelId, token)}
                              >
                                Leave Channel
                              </Button>
                            </Grid>
                          </Grid>
                      )
                      : (
                          <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => joinChannel(channelId, token)}
                          >
                            Join Channel
                          </Button>
                      )}
                </ListItem>
              </List>
              {viewerIsMember && <ChannelMessages channelId={channelId}/>}
            </>
        )}
      </>
  );
}

export default Channel;
