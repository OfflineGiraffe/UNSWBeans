import { Typography } from '@material-ui/core';
import React from 'react';
import { Scatter } from 'react-chartjs-2';
import AuthContext from '../AuthContext';
import { makeRequest } from '../utils/axios_wrapper';

function WorkspaceStats() {
  const token = React.useContext(AuthContext);
  const [utilizationRate, setUtilizationRate] = React.useState(0);
  const [channelsData, setChannelsData] = React.useState([]);
  const [dmsData, setDmsData] = React.useState([]);
  const [messagesData, setMessagesData] = React.useState([]);

  React.useEffect(() => {
    makeRequest('GET', 'USERS_STATS', { token })
        .then(({ data }) => {
          console.log(data);
          const { workspaceStats } = data;
          setUtilizationRate(workspaceStats['utilizationRate']);
          setChannelsData(workspaceStats['channelsExist'].map(obj => {
            return {
              x: new Date(obj['timeStamp'] * 1000),
              y: obj['numChannelsExist'],
            };
          }));
          setDmsData(workspaceStats['dmsExist'].map(obj => {
            return {
              x: new Date(obj['timeStamp'] * 1000),
              y: obj['numDmsExist'],
            };
          }));
          setMessagesData(workspaceStats['messagesExist'].map(obj => {
            return {
              x: new Date(obj['timeStamp'] * 1000),
              y: obj['numMessagesExist'],
            };
          }));
        })
        .catch(err => console.log(err));
  }, [token]);

  return (
      <>
        <Typography variant="h5">Workspace statistics</Typography>
        <p>Wow! {(utilizationRate * 100).toFixed(2)}% utilisation</p>
        <Scatter
            data={{
              datasets: [
                {
                  label: 'Channels',
                  data: channelsData,
                  fill: false,
                  borderColor: '#742774',
                  showLine: true,
                },
                {
                  label: 'Dms',
                  data: dmsData,
                  fill: false,
                  borderColor: '#4287f5',
                  showLine: true,
                },
                {
                  label: 'Messages',
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

export default WorkspaceStats;
