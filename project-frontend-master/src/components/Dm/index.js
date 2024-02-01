import {
  Avatar,
  Button,
  Grid,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  Typography,
} from '@material-ui/core';
import React from 'react';
import AuthContext from '../../AuthContext';
import { makeRequest } from '../../utils/axios_wrapper';
import { useStep } from '../../utils/update';
import Placeholder from '../Placeholder';
import DmMessages from './DmMessages';

function Dm({ dmId, ...props }) {
  const [loading, setLoading] = React.useState(true);
  const [name, setName] = React.useState('');
  const [membersList, setMembersList] = React.useState([]);
  const token = React.useContext(AuthContext);

  function fetchDmData() {
    makeRequest('GET', 'DM_DETAILS', {
      token,
      dmId,
    }).then(({ data }) => {
      const { name, members } = data;
      // assumes members of form [{ uId, nameFirst, nameLast }]
      console.log(members);
      setMembersList(members);
      setName(name);
    })
        .catch(err => {
          console.log(err)
          setMembersList([]);
          setName('');
        })
        .finally(() => setLoading(false));
  }

  useStep(fetchDmData, [dmId, token], 2);

  function leaveDm(dmId, token) {
    makeRequest('POST', 'DM_LEAVE', { token, dmId: Number.parseInt(dmId) })
        .then(() => {
          fetchDmData(dmId, token);
        })
        .catch(err => console.log(err));
  }

  function removeDm(dmId, token) {
    makeRequest('DELETE', 'DM_REMOVE', {
      token,
      dmId: Number.parseInt(dmId),
    }).then(() => {
      fetchDmData(dmId, token);
    }).catch(err => console.log(err));
  }

  return (
      <>
        {loading ? <Placeholder/> : (
            <>
              <Typography variant="h4">{name.toUpperCase()}</Typography>
              <List subheader={<ListSubheader>Members</ListSubheader>}>
                {membersList.map(({ uId, nameFirst, nameLast, profileImgUrl }) => (
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
                              .filter(s =>
                                  s != null && s !== '',
                              )
                              .map(s => s[0])
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
                                  </Grid>
                                </Grid>
                              </>
                          )}
                      />
                    </ListItem>
                ))}
                <ListItem key="leave_dm">
                  <Grid container spacing={1}>
                    <Grid item>
                      <Button variant="outlined" onClick={() => leaveDm(dmId, token)}>
                        Leave Dm
                      </Button>
                      &nbsp;
                      <Button variant="outlined" onClick={() => removeDm(dmId, token)}>
                        Remove Dm
                      </Button>
                    </Grid>
                  </Grid>
                </ListItem>
              </List>
              <DmMessages dmId={dmId}/>
            </>
        )}
      </>
  );
}

export default Dm;
