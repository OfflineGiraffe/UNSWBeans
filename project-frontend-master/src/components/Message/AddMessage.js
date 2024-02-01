import { Button, IconButton, InputAdornment, TextField, Typography } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import TimerIcon from '@material-ui/icons/Timer';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import AuthContext from '../../AuthContext';
import { useInterval } from '../../utils';
import { makeRequest } from '../../utils/axios_wrapper';
import { useStep } from '../../utils/update';
import { StepContext } from '../Channel/ChannelMessages';
import { StepContextDm } from '../Dm/DmMessages';
import AddMessageTimerDialog from './AddMessageTimerDialog';

const useStyles = makeStyles(theme => ({
  flex: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    margin: theme.spacing(1),
    marginRight: 0,
  },
  button: {
    margin: theme.spacing(1),
    marginLeft: 0,
    alignSelf: 'stretch',
  },
  rightIcon: {
    marginLeft: theme.spacing(1),
  },
  standupTimer: {
    margin: theme.spacing(2),
  },
}));

const TIMER_INACTIVE_VALUE = -1;

function AddMessage({ channelId = -1, dmId = -1 }) {
  const classes = useStyles();
  const [currentMessage, setCurrentMessage] = React.useState('');
  const [currentTimer, setCurrentTimer] = React.useState(TIMER_INACTIVE_VALUE);
  const [timerDialogOpen, setTimerDialogOpen] = React.useState(false);
  const token = React.useContext(AuthContext);
  let onAdd = React.useContext(StepContext);
  let onAddDm = React.useContext(StepContextDm);
  onAdd = onAdd ? onAdd : () => {}; // sanity check
  onAddDm = onAddDm ? onAddDm : () => {}; // sanity check

  const isTimerSet = currentTimer !== TIMER_INACTIVE_VALUE;

  const [standupRemaining, setStandupRemaining] = React.useState();
  const [standupEndTime, setStandupEndTime] = React.useState();

  const submitMessage = () => {
    const message = currentMessage.trim();
    if (!message) {
      return;
    }
    setCurrentMessage('');

    /**
     * Sending a message when a standup is active
     * note: probably makes sense that this takes precedence over
     *       starting a standup.
     */
    if (dmId === -1 && standupRemaining && standupRemaining > 0) {
      makeRequest('POST', 'STANDUP_SEND', {
        token,
        channelId: Number.parseInt(channelId),
        message,
      }).then(({ data }) => {
        console.log(data);
        onAdd();
      })
          .catch(err => console.log(err));
      return;
    }

    /**
     * Sending a message when the sendlater timer has been set
     */
    if (isTimerSet) {
      if (dmId === -1) {
        makeRequest('POST', 'MESSAGE_SENDLATER', {
          token,
          channelId: Number.parseInt(channelId),
          message,
          timeSent: currentTimer.getTime() / 1000, // ms to s conversion
        }).then(({ data }) => console.log(data)).catch(err => console.log(err));
      } else {
        makeRequest('POST', 'MESSAGE_SENDLATERDM', {
          token,
          dmId: Number.parseInt(dmId),
          message,
          timeSent: currentTimer.getTime() / 1000, // ms to s conversion
        }).then(({ data }) => console.log(data)).catch(err => console.log(err));
      }
      setCurrentTimer(TIMER_INACTIVE_VALUE);
      return;
    }

    /**
     * Starting a standup (any message which starts with /standup)
     */
    if (dmId === -1 && message.startsWith('/standup')) {
      const re = /\/standup\s+([1-9][0-9]*)/;
      const found = message.match(re);
      if (!found || found.length < 2) {
        alert('Usage: /standup <duration in seconds>');
      } else {
        var length = parseInt(found[1], 10);
        if (isNaN(length) || !Number.isInteger(length)) {
          alert('Usage: /standup <duration in seconds>');
        } else {
          makeRequest('POST', 'STANDUP_START', {
            token,
            channelId: Number.parseInt(channelId),
            length,
          }).then(({ data }) => {
            const { timeFinish } = data;
            setStandupEndTime(timeFinish);
            alert(`You've started a standup for ${length} seconds`);
          }).catch(err => console.log(err));
        }
      }
      return;
    }

    /**
     * Default message sending behaviour
     */
    if (dmId === -1) {
      makeRequest('POST', 'MESSAGE_SEND', {
        token,
        channelId: Number.parseInt(channelId),
        message,
      }).then(({ data }) => {
        console.log(data);
        onAdd();
      })
          .catch(err => console.log(err));
    } else {
      makeRequest('POST', 'MESSAGE_SENDDM', {
        token,
        dmId: Number.parseInt(dmId),
        message,
      }).then(({ data }) => {
        console.log(data);
        onAddDm();
      }).catch(err => console.log(err));
    }
  };

  useInterval(() => {
    if (standupEndTime > Date.now() / 1000) {
      setStandupRemaining(() => Math.round(standupEndTime - Math.round(Date.now() / 1000)));
    } else {
      setStandupRemaining();
    }
  }, 1000);

  const checkStandupActive = () => {
    if (channelId === -1) {
      return;
    }
    makeRequest('GET', 'STANDUP_ACTIVE', {
      token,
      channelId,
    }).then(({ data }) => {
      const { isActive = false, timeFinish } = data;
      if (isActive && timeFinish) {
        setStandupEndTime(timeFinish);
      } else {
        setStandupRemaining(0);
        setStandupEndTime(-1);
      }
    }).catch(err => console.log(err));
  };

  useStep(checkStandupActive, [currentMessage] /* check when user is typing */);

  React.useEffect(checkStandupActive, [channelId]);

  const keyDown = e => {
    if (e.key === 'Enter' && !e.getModifierState('Shift')) {
      e.preventDefault();
      submitMessage();
    }
  };

  return (
      <>
        {standupRemaining > 0 && (
            <Typography variant="caption" className={classes.standupTimer}>
              {`STANDUP ACTIVE: ${standupRemaining} seconds remaining`}
            </Typography>
        )}
        <div className={classes.flex}>
          <TextField
              className={classes.input}
              label="Send a message 💬"
              multiline
              placeholder="..."
              fullWidth
              margin="normal"
              variant="filled"
              onKeyDown={keyDown}
              value={currentMessage}
              onChange={e => setCurrentMessage(e.target.value)}
              InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                          aria-label="toggle visibility"
                          disabled={standupRemaining > 0}
                          onClick={() =>
                              isTimerSet ? setCurrentTimer(-1) : setTimerDialogOpen(true)}
                      >
                        <TimerIcon color={isTimerSet ? 'secondary' : undefined}/>
                      </IconButton>
                    </InputAdornment>
                ),
              }}
          />
          <Button
              className={classes.button}
              variant="contained"
              color="primary"
              onClick={submitMessage}
          >
            Send
            <SendIcon className={classes.rightIcon}/>
          </Button>
        </div>
        <AddMessageTimerDialog
            open={timerDialogOpen}
            handleClose={() => setTimerDialogOpen(false)}
            onTimerChange={setCurrentTimer}
        />
      </>
  );
}

export default AddMessage;
