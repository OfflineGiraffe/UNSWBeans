import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
} from '@material-ui/core';
import React from 'react';
import AuthContext from '../../AuthContext';
import { makeRequest } from '../../utils/axios_wrapper';
import { PERMISSION_IDS } from '../../utils/constants';

function SetUserPermissionsDialog({ children, ...props }) {
  const [open, setOpen] = React.useState(false);
  const [permissionId, setPermissionId] = React.useState(PERMISSION_IDS.MEMBER);
  const [users, setUsers] = React.useState([]);
  const [selectedUser, setSelectedUser] = React.useState('');
  const token = React.useContext(AuthContext);

  React.useEffect(() => {
    function fetchUserData() {
      makeRequest('GET', 'USERS_ALL', { token })
          .then(({ data }) => {
            setUsers(data['users']);
          })
          .catch(err => console.log(err));
    }
    fetchUserData();
  }, [token]);

  const handleRadioChange = event => {
    const newPermissionId = parseInt(event.target.value, 10);
    setPermissionId(newPermissionId);
  };

  const handleUserSelect = event => {
    const newUserId = parseInt(event.target.value, 10);
    setSelectedUser(newUserId);
  };

  function handleClickOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!event.target[0].value) {
      return;
    }

    const uId = parseInt(event.target[0].value, 10);

    makeRequest('POST', 'ADMIN_USERPERMISSION_CHANGE', {
      token,
      uId: Number.parseInt(uId),
      permissionId: Number.parseInt(permissionId),
    }).then(response => {
      console.log(response);
    }).catch(err => console.log(err));
  }

  return (
      <>
        <div onClick={handleClickOpen}>{children}</div>
        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Set User Permissions</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <DialogContentText>
                Select a user below to set permissions for this user
              </DialogContentText>
              <Grid container spacing={2} direction="row" justify="center" alignItems="center">
                <Grid item xs={12}>
                  <Select
                      style={{ width: '100%' }}
                      id="uId"
                      onChange={handleUserSelect}
                      value={selectedUser}
                  >
                    {users.map((d, idx) => {
                      return (
                          <MenuItem key={d.uId} value={d.uId}>{d.nameFirst} {d.nameLast}</MenuItem>
                      );
                    })}
                  </Select>
                </Grid>
                <Grid container item justify="center" alignItems="center">
                  <RadioGroup
                      aria-label="position"
                      name="position"
                      value={permissionId}
                      onChange={handleRadioChange}
                      row
                  >
                    <FormControlLabel
                        value={PERMISSION_IDS.MEMBER}
                        control={<Radio color="primary"/>}
                        label="Member"
                        labelPlacement="bottom"
                    />
                    <FormControlLabel
                        value={PERMISSION_IDS.OWNER}
                        control={<Radio color="primary"/>}
                        label="Owner"
                        labelPlacement="bottom"
                    />
                  </RadioGroup>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">Cancel</Button>
              <Button onClick={handleClose} type="submit" color="primary">Set</Button>
            </DialogActions>
          </form>
        </Dialog>
      </>
  );
}

export default SetUserPermissionsDialog;
