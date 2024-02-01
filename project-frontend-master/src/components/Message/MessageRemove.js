import { IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import React from 'react';
import AuthContext from '../../AuthContext';
import { makeRequest } from '../../utils/axios_wrapper';
import { StepContext } from '../Channel/ChannelMessages';
import { StepContextDm } from '../Dm/DmMessages';

function MessageRemove({ messageId, disabled = false }) {
  const token = React.useContext(AuthContext);

  let step = React.useContext(StepContext);
  let stepDm = React.useContext(StepContextDm);
  step = step ? step : () => {}; // sanity check
  stepDm = stepDm ? stepDm : () => {}; // sanity check

  const messageRemove = () => {
    makeRequest('DELETE', 'MESSAGE_REMOVE', {
      token,
      messageId: Number.parseInt(messageId),
    }).then(() => {
      step();
      stepDm();
    });
  };

  return (
      <IconButton
          disabled={disabled}
          onClick={messageRemove}
          style={{ margin: 1 }}
          size="small"
          edge="end"
          aria-label="delete"
      >
        <DeleteIcon fontSize="small"/>
      </IconButton>
  );
}

export default MessageRemove;
