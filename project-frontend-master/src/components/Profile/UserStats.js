import { Typography } from '@material-ui/core';
import React from 'react';
import { Scatter } from 'react-chartjs-2';
import AuthContext from '../../AuthContext';
import { makeRequest } from '../../utils/axios_wrapper';

function UserStats() {
  const token = React.useContext(AuthContext);
  const [involvementRate, setInvolvementRate] = React.useState(0);
  const [channelsData, setChannelsData] = React.useState([]);
  const [dmsData, setDmsData] = React.useState([]);
  const [messagesData, setMessagesData] = React.useState([]);

  React.useEffect(() => {
    makeRequest('GET', 'USER_STATS', { token })
        .then(({ data }) => {
          console.log(data);
          const { userStats } = data;
          setInvolvementRate(userStats['involvementRate']);
          setChannelsData(userStats['channelsJoined'].map(obj => {
            return {
              x: new Date(obj['timeStamp'] * 1000),
              y: obj['numChannelsJoined'],
            };
          }));
          setDmsData(userStats['dmsJoined'].map(obj => {
            return {
              x: new Date(obj['timeStamp'] * 1000),
              y: obj['numDmsJoined'],
            };
          }));
          setMessagesData(userStats['messagesSent'].map(obj => {
            return {
              x: new Date(obj['timeStamp'] * 1000),
              y: obj['numMessagesSent'],
            };
          }));
        })
        .catch(err => console.log(err));
  }, [token]);

  return (
      <>
        <Typography variant="h5">User statistics</Typography>
        <p>Involvement rate: {(involvementRate * 100).toFixed(2)}%</p>
        <Scatter
            data={{
              datasets: [
                {
                  label: 'Channels joined',
                  data: channelsData,
                  fill: false,
                  borderColor: '#742774',
                  showLine: true,
                },
                {
                  label: 'Dms joined',
                  data: dmsData,
                  fill: false,
                  borderColor: '#4287f5',
                  showLine: true,
                },
                {
                  label: 'Messages sent',
                  data: messagesData,
                  fill: false,
                  borderColor: '#bd2d4f',
                  showLine: true,
                },
              ],
            }}
            options={{
              scales: {
                xAxes: [{
                  title: 'time',
                  type: 'time',
                  gridLines: {
                    lineWidth: 2,
                  },
                  time: {
                    unitStepSize: 200,
                    displayFormats: {
                      millisecond: 'MMM DD HH:mm',
                      second: 'MMM DD HH:mm',
                      minute: 'MMM DD HH:mm',
                      hour: 'MMM DD HH:mm',
                      day: 'MMM DD',
                      week: 'MMM DD',
                      month: 'MMM DD',
                      quarter: 'MMM DD',
                      year: 'MMM DD',
                    },
                  },
                }],
              },
            }}
        />
      </>
  );
}

export default UserStats;
