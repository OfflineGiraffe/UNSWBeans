import { IconButton } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import React from 'react';
import AuthContext from '../../AuthContext';
import { makeRequest } from '../../utils/axios_wrapper';
import { StepContext } from '../Channel/ChannelMessages';
import { StepContextDm } from '../Dm/DmMessages';

function MessageEdit({ messageId, disabled = false }) {
  const token = React.useContext(AuthContext);

  let step = React.useContext(StepContext);
  let stepDm = React.useContext(StepContextDm);
  step = step ? step : () => {}; // sanity check
  stepDm = stepDm ? stepDm : () => {}; // sanity check

  const messageEdit = () => {
    const message = prompt();
    if (message === null) {
      return; // basic validation
    }

    /**
     * Empty message should delete original
     */
    if (message === '') {
      makeRequest('DELETE', 'MESSAGE_REMOVE', {
        token,
        messageId: Number.parseInt(messageId),
      }).then(() => {
        step();
        stepDm();
      }).catch(err => console.log(err));
      return;
    }

    /**
     * Default message edit behaviour
     */
    makeRequest('PUT', 'MESSAGE_EDIT', {
      token,
      messageId: Number.parseInt(messageId),
      message,
    }).then(() => {
      step();
      stepDm();
    }).catch(err => console.log(err));
  };

  return (
      <IconButton
          disabled={disabled}
          onClick={messageEdit}
          style={{ margin: 1 }}
          size="small"
          edge="end"
          aria-label="delete"
      >
        <EditIcon fontSize="small"/>
      </IconButton>
  );
}

export default MessageEdit;
