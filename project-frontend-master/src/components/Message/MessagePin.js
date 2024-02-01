import { IconButton } from '@material-ui/core';
import { withTheme } from '@material-ui/styles';
import { mdiPin, mdiPinOutline } from '@mdi/js';
import MdiIcon from '@mdi/react';
import React from 'react';
import AuthContext from '../../AuthContext';
import { makeRequest } from '../../utils/axios_wrapper';
import { StepContext } from '../Channel/ChannelMessages';
import { StepContextDm } from '../Dm/DmMessages';

function MessagePin({ messageId, isPinned = false, theme }) {
  const [isPinnedState, setIsPinnedState] = React.useState(isPinned);
  React.useEffect(() => setIsPinnedState(isPinned), [isPinned]);

  const token = React.useContext(AuthContext);
  let step = React.useContext(StepContext);
  let stepDm = React.useContext(StepContextDm);
  step = step ? step : () => {}; // sanity check
  stepDm = stepDm ? stepDm : () => {}; // sanity check

  const toggle = () => {
    if (isPinnedState) {
      makeRequest('POST', 'MESSAGE_UNPIN', {
        token,
        messageId: Number.parseInt(messageId),
      }).then(() => {
        step();
        stepDm();
      }).catch(err => console.log(err));
    } else {
      makeRequest('POST', 'MESSAGE_PIN', {
        token,
        messageId: Number.parseInt(messageId),
      }).then(() => {
        step();
        stepDm();
      }).catch(err => console.log(err));
    }
    // Optimistic re-rendering
    // setIsPinned(isPinnedState => !!!isPinnedState);
  };

  return (
      <IconButton
          onClick={toggle}
          style={{ margin: 1 }}
          size="small"
          edge="end"
          aria-label="delete"
      >
        {isPinnedState
            ? <MdiIcon path={mdiPin} size="1em" color={theme && theme.palette.action.active}/>
            : (
                <MdiIcon
                    path={mdiPinOutline}
                    size="1em"
                    color={theme && theme.palette.action.active}
                />
            )}
      </IconButton>
  );
}

export default withTheme(MessagePin);
