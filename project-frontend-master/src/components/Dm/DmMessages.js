import { Button, List, ListItem, ListSubheader } from '@material-ui/core';
import { makeRequest } from '../../utils/axios_wrapper';
import React from 'react';
import AuthContext from '../../AuthContext';
import { PAGINATION_SIZE, SLICE_SIZE } from '../../utils/constants';
import { useStep } from '../../utils/update';
import Message from '../Message';
import AddMessage from '../Message/AddMessage';

export const StepContextDm = React.createContext();
export const StepProvider = StepContextDm.Provider;
export const StepConsumer = StepContextDm.Consumer;

function DmMessages({ dmId = '' }) {
  const [messages, setMessages] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    dmId,
    isPaginating: false,
    currentStart: 0,
    currentEnd: 0,
    sliceStart: 0,
  });
  const token = React.useContext(AuthContext);

  const fetchDmMessages = () => {
    const p = pagination.dmId === dmId ? pagination : {
      dmId,
      isPaginating: false,
      currentStart: 0,
      currentEnd: 0,
      sliceStart: 0,
    };
    makeRequest('GET', 'DM_MESSAGES', {
      token,
      dmId: Number.parseInt(dmId),
      start: p.isPaginating ? p.currentStart : 0,
    }).then(({ data }) => {
      const { messages: newMessages, end } = data;
      setPagination({ ...p, dmId, currentEnd: end }); // TODO: add/remove problems
      setMessages(newMessages);
    }).catch(err => console.log(err));
  };
  useStep(fetchDmMessages, [dmId, pagination.currentStart]);

  const onPrev = () =>
      setPagination(({ sliceStart, currentStart, currentEnd, ...pagination }) => {
        const pageSize = messages.length;

        if (sliceStart + SLICE_SIZE < pageSize) {
          return {
            ...pagination,
            currentStart,
            currentEnd,
            sliceStart: sliceStart + SLICE_SIZE,
            isPaginating: true,
          };
        }

        return {
          ...pagination,
          currentEnd,
          currentStart: currentEnd,
          sliceStart: 0,
          isPaginating: true,
        };
      });

  const onNext = () =>
      setPagination(({ sliceStart, currentStart, ...pagination }) => {
        if (sliceStart >= SLICE_SIZE) {
          return {
            ...pagination,
            currentStart,
            sliceStart: sliceStart - SLICE_SIZE,
            isPaginating: !(currentStart == 0 && sliceStart == SLICE_SIZE),
          };
        }

        if (currentStart >= PAGINATION_SIZE) {
          if (currentStart) {
            return {
              ...pagination,
              currentStart: currentStart - PAGINATION_SIZE,
              sliceStart: PAGINATION_SIZE - SLICE_SIZE,
            };
          }
        }

        return {
          ...pagination,
          currentStart: 0,
          sliceStart: 0,
          isPaginating: false,
        };
      });

  const { currentStart, currentEnd, sliceStart, isPaginating } = pagination;

  const isEnd = currentEnd == -1 && sliceStart >= messages.length - SLICE_SIZE;

  const pinnedMessages = messages.filter(m => m.isPinned);
  const subheader = !messages.length
      ? `Messages (None)`
      : `Messages [${currentStart + sliceStart + 1}...${
          Math.min(currentStart + messages.length, currentStart + sliceStart + SLICE_SIZE)
      }]`;

  return (
      <StepProvider value={fetchDmMessages}>
        {pinnedMessages.length > 0 && (
            <>
              <hr/>
              <List subheader={<ListSubheader>Pinned Messages</ListSubheader>}>
                {pinnedMessages.map(m => <Message key={m.messageId} {...m}/>)}
              </List>
            </>
        )}
        <hr/>
        <List subheader={<ListSubheader>{subheader}</ListSubheader>} style={{ width: '100%' }}>
          {!isEnd && (
              <ListItem>
                <Button variant="outlined" color="secondary" onClick={onPrev}>
                  Previous messages
                </Button>
              </ListItem>
          )}
          {messages.slice(sliceStart, sliceStart + SLICE_SIZE).reverse().map(message => (
              <Message key={message.messageId} {...message}/>
          ))}
          {isPaginating && (
              <ListItem>
                <Button variant="outlined" color="secondary" onClick={onNext}>Next messages</Button>
              </ListItem>
          )}
        </List>
        <AddMessage dmId={dmId}/>
      </StepProvider>
  );
}

export default DmMessages;
