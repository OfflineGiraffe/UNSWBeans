import { List, ListItem, ListItemIcon, ListItemText, ListSubheader } from '@material-ui/core';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import { makeRequest } from '../utils/axios_wrapper';
import React from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../AuthContext';
import { useStep } from '../utils/update';
import AddDmDialog from './Dm/AddDmDialog';

function DmList({ dmId: currDmId }) {
  const [myDms, setMyDms] = React.useState([]);

  const token = React.useContext(AuthContext);

  const fetchDmsData = () => {
    makeRequest('GET', 'DM_LIST', { token })
        .then(({ data }) => {
          setMyDms(data['dms']);
        })
        .catch(err => console.log(err));
  };

  useStep(fetchDmsData, [], 2);

  return (
      <>
        <List
            subheader={(
                <ListSubheader style={{ display: 'flex' }}>
                  <span style={{ flex: 1 }}>My Dms</span>
                  <AddDmDialog callback={fetchDmsData}/>
                </ListSubheader>
            )}
        >
          {myDms.map(({ dmId, name }) => (
              <ListItem button key={dmId} component={Link} to={`/dm/${dmId}`}>
                <ListItemIcon>
                  {dmId == currDmId
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

export default DmList;
