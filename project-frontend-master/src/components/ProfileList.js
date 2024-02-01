import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
import React from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../AuthContext';
import { extractUId } from '../utils/token';

function ProfileList() {
  const uid = extractUId(React.useContext(AuthContext));
  return (
      <List>
        <ListItem button key={'profile'} component={Link} to={`/profile/${uid}`}>
          <ListItemIcon>
            <AccountCircle/>
          </ListItemIcon>
          <ListItemText primary="Profile"/>
        </ListItem>
      </List>
  );
}

export default ProfileList;
