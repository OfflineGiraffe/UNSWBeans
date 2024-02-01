import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Switch,
  TextField,
} from '@material-ui/core';
import Add from '@material-ui/icons/Add';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import React from 'react';
import AuthContext from '../../AuthContext';
import { makeRequest } from '../../utils/axios_wrapper';

function AddChannelDialog({ ...props }) {
  const [open, setOpen] = React.useState(false);
  const token = React.useContext(AuthContext);
  function handleClickOpen() {
    setOpen(true);
  }
  function handleClose() {
    setOpen(false);
  }
  function handleSubmit(event) {
    event.preventDefault();
    const name = event.target[0].value;
    const secret = event.target[1].checked;
    const isPublic = !secret;

    if (!name) {
      return;
    }

    makeRequest('POST', 'CHANNELS_CREATE', { token, name, isPublic })
        .then(response => {
          console.log(response);
          props.callback();
        })
        .catch(err => console.log(err));
  }

  return (
      <div>
        <IconButton size="small" onClick={handleClickOpen}>
          <Add/>
        </IconButton>
        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Create Channel</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <DialogContentText>Complete the form below to create a new channel</DialogContentText>
              <Grid container spacing={2} direction="row" justify="center" alignItems="center">
                <Grid item xs={12}>
                  <TextField
                      autoFocus
                      margin="dense"
                      id="channelName"
                      label="Channel Name"
                      name="channelName"
                      fullWidth
                  />
                </Grid>
                <Grid container item justify="center" alignItems="center">
                  <Visibility/>
                  <FormControlLabel
                      control={<Switch value="secret" inputProps={{ 'aria-label': 'Secret' }}/>}
                      label="Secret"
                      labelPlacement="top"
                  />
                  <VisibilityOff/>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">Cancel</Button>
              <Button onClick={handleClose} type="submit" color="primary">Create</Button>
            </DialogActions>
          </form>
        </Dialog>
      </div>
  );
}

export default AddChannelDialog;
