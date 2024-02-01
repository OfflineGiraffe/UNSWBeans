import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { makeRequest } from '../utils/axios_wrapper';
import React from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../AuthContext';

export default function NotificationList() {
  const [open, setOpen] = React.useState(false);
  const [notifs, setNotifs] = React.useState([]);
  const buttonRef = React.useRef();
  const token = React.useContext(AuthContext);

  React.useEffect(() => {
    makeRequest('GET', 'NOTIFICATIONS_GET', { token })
        .then(({ data }) => {
          setNotifs(data.notifications);
        })
        .catch(err => console.log(err));
  }, [open, token]);

  const handleClick = event => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
      <div>
        <Button
            ref={buttonRef}
            aria-controls="simple-menu"
            aria-haspopup="true"
            onClick={handleClick}
            color="inherit"
        >
          Notifications
        </Button>
        <Menu
            id="simple-menu"
            anchorEl={buttonRef.current}
            keepMounted
            open={open}
            onClose={handleClose}
        >
          {notifs.length === 0 ? <div>&nbsp;You don't have any notifications.&nbsp;</div> : (
              notifs.map(notif => {
                if (notif.dmId === -1) {
                  return (
                      <MenuItem component={Link} to={`/channel/${notif.channelId}`}>
                        {notif.notificationMessage}
                      </MenuItem>
                  );
                } else {
                  return (
                      <MenuItem component={Link} to={`/dm/${notif.dmId}`}>
                        {notif.notificationMessage}
                      </MenuItem>
                  );
                }
              })
          )}
          <MenuItem onClick={handleClose}>Close</MenuItem>
        </Menu>
      </div>
  );
}
