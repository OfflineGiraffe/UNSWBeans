import { Badge, IconButton } from '@material-ui/core';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbUpOutlinedIcon from '@material-ui/icons/ThumbUpOutlined';
import React from 'react';
import AuthContext from '../../AuthContext';
import { makeRequest } from '../../utils/axios_wrapper';
import { StepContext } from '../Channel/ChannelMessages';
import { StepContextDm } from '../Dm/DmMessages';

function MessageReact({ messageId, reacts = [] /* [{ reactId, uIds }] */ }) {
  const token = React.useContext(AuthContext);
  let step = React.useContext(StepContext);
  let stepDm = React.useContext(StepContextDm);
  step = step ? step : () => {}; // sanity check
  stepDm = stepDm ? stepDm : () => {}; // sanity check

  const messageReact = isReacted => {
    if (isReacted) {
      makeRequest('POST', 'MESSAGE_UNREACT', {
        token,
        messageId: Number.parseInt(messageId),
        reactId: 1,
      }).then(() => {
        step();
        stepDm();
      }).catch(err => console.log(err));
    } else {
      makeRequest('POST', 'MESSAGE_REACT', {
        token,
        messageId: Number.parseInt(messageId),
        reactId: 1,
      }).then(() => {
        step();
        stepDm();
      }).catch(err => console.log(err));
    }
  };

  let thumbUpCount = 0;
  let isReacted = false;
  const thumbUpIndex = reacts.findIndex(react => react.reactId === 1);
  if (thumbUpIndex !== -1) {
    thumbUpCount = reacts[thumbUpIndex].uIds.length;
    isReacted = reacts[thumbUpIndex].isThisUserReacted;
  }

  return (
      <Badge
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          badgeContent={thumbUpCount}
          color="secondary"
      >
        <IconButton
            onClick={() => messageReact(isReacted)}
            style={{ margin: 1 }}
            size="small"
            edge="end"
            aria-label="delete"
        >
          {isReacted ? <ThumbUpIcon fontSize="small"/> : <ThumbUpOutlinedIcon fontSize="small"/>}
        </IconButton>
      </Badge>
  );
}

export default MessageReact;
