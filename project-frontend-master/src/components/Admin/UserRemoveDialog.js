import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  MenuItem,
  Select,
} from '@material-ui/core';
import React from 'react';
import AuthContext from '../../AuthContext';
import { makeRequest } from '../../utils/axios_wrapper';

function UserRemoveDialog({ children, ...props }) {
  const [open, setOpen] = React.useState(false);
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

    makeRequest('DELETE', 'ADMIN_USER_REMOVE', {
      token,
      uId: Number.parseInt(uId),
    }).then(response => {
      console.log(response);
    }).catch(err => console.log(err));
  }

  return (
      <>
        <div onClick={handleClickOpen}>{children}</div>
        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Remove Users</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <DialogContentText>Select a user below to remove</DialogContentText>
              <Grid container spacing={2} direction="row" justify="center" alignItems="center">
                <Grid item xs={12}>
                  <Select
                      style={{ width: '100%' }}
                      id="uId"
                      onChange={handleUserSelect}
                      value={selectedUser}
                  >
                    {users.map(d => {
                      return (
                          <MenuItem key={d.uId} value={d.uId}>{d.nameFirst} {d.nameLast}</MenuItem>
                      );
                    })}
                  </Select>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">Cancel</Button>
              <Button onClick={handleClose} type="submit" color="primary">Remove</Button>
            </DialogActions>
          </form>
        </Dialog>
      </>
  );
}

export default UserRemoveDialog;
