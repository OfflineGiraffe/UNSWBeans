import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import React from 'react';
import AuthContext from '../../AuthContext';
import { makeRequest } from '../../utils/axios_wrapper';
import { useStep } from '../../utils/update';

function MessageShareDialog({ ogMessageId, ...props }) {
  const [open, setOpen] = React.useState(false);
  const [selectedChannel, setSelectedChannel] = React.useState(-1);
  const [selectedDm, setSelectedDm] = React.useState(-1);
  const [selectedChDm, setSelectedChDm] = React.useState('');
  const [channelsShare, setChannelsShare] = React.useState([]);
  const [dmsShare, setDmsShare] = React.useState([]);
  const [message, setMessage] = React.useState('');

  const token = React.useContext(AuthContext);

  const step = useStep();

  React.useEffect(() => {
    function fetchChannelData() {
      makeRequest('GET', 'CHANNELS_LIST', {
        token,
      }).then(({ data }) => {
        setChannelsShare(data['channels']);
      })
          .catch(err => console.log(err));
      makeRequest('GET', 'DM_LIST', {
        token,
      }).then(({ data }) => {
        setDmsShare(data['dms']);
      })
          .catch(err => console.log(err));
    }
    fetchChannelData();
  }, [token]);

  const handleChannelSelect = event => {
    setSelectedChDm(event.target.value);
    if (event.target.value.slice(0, 1) === 'd') {
      setSelectedDm(event.target.value.slice(1));
      setSelectedChannel(-1);
    } else {
      setSelectedChannel(event.target.value.slice(1));
      setSelectedDm(-1);
    }
  };

  function handleClickOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  const handleChange = event => {
    setMessage(event.target.value);
  };

  function handleSubmit(event) {
    event.preventDefault();
    makeRequest('POST', 'MESSAGE_SHARE', {
      token,
      ogMessageId: Number.parseInt(ogMessageId),
      message,
      channelId: Number.parseInt(selectedChannel),
      dmId: Number.parseInt(selectedDm),
    }).then(response => {
      console.log(response);
      step();
    }).catch(err => console.log(err));
  }
  return (
      <div>
        <IconButton
            onClick={handleClickOpen}
            style={{ margin: 1 }}
            size="small"
            edge="end"
            aria-label="share"
        >
          <ArrowForwardIcon fontSize="small"/>
        </IconButton>
        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Share message</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <DialogContentText>Enter a channel below to share the message to</DialogContentText>
              <Select
                  style={{ width: '100%' }}
                  id="u_id"
                  onChange={handleChannelSelect}
                  value={selectedChDm}
              >
                {channelsShare.map(d => {
                  return <MenuItem key={d.channelId} value={`c${d.channelId}`}>{d.name}</MenuItem>;
                })}
                {dmsShare.map(d => {
                  return <MenuItem key={d.dmId} value={`d${d.dmId}`}>{d.name}</MenuItem>;
                })}
              </Select>
              <br/>
              <br/>
              <DialogContentText>Optionally, enter an additional message</DialogContentText>
              <TextField multiline fullWidth rowsMax={4} value={message} onChange={handleChange}/>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">Cancel</Button>
              <Button onClick={handleClose} type="submit" color="primary">Share</Button>
            </DialogActions>
          </form>
        </Dialog>
      </div>
  );
}

export default MessageShareDialog;
