import { List, ListItem, ListSubheader, TextField, Typography } from '@material-ui/core';
import React from 'react';
import AuthContext from '../../AuthContext';
import { makeRequest } from '../../utils/axios_wrapper';
import { extractUId } from '../../utils/token';
import Placeholder from '../Placeholder';
import EditableFields from './EditableFields';
import UserStats from './UserStats';

function Profile({ profile }) {
  const [loading, setLoading] = React.useState(true);
  const [profileDetails, setProfileDetails] = React.useState({});
  const token = React.useContext(AuthContext);
  const uId = extractUId(token);

  React.useEffect(() => {
    makeRequest('GET', 'USER_PROFILE', {
      token,
      uId: profile,
    }).then(({ data }) => {
      console.log(data);
      const { user } = data;
      setProfileDetails(user);
    })
        .catch(err => {console.log(err)})
        .finally(() => setLoading(false));
  }, [profile, token]);

  function updateName(nameLast, nameFirst) {
    makeRequest('PUT', 'USER_PROFILE_SETNAME', { token, nameFirst, nameLast })
        .then(({ data }) => {
          console.log(data);
        })
        .catch(err => {
          console.log(err);
        });
  }

  function updateEmail(email) {
    makeRequest('PUT', 'USER_PROFILE_SETEMAIL', { token, email })
        .then(({ data }) => {
          console.log(data);
        })
        .catch(err => {
          console.log(err);
        });
  }

  function updateProfileImgUrl(rawText) {
    const items = rawText.split(',');
    makeRequest('POST', 'USER_PROFILE_UPLOADPHOTO', {
      token,
      imgUrl: items[0],
      xStart: Number.parseInt(items[1]),
      yStart: Number.parseInt(items[2]),
      xEnd: Number.parseInt(items[3]),
      yEnd: Number.parseInt(items[4]),
    }).then(({ data }) => {
      console.log(data);
    }).catch(err => console.log(err));
  }

  function updateHandle(handleStr) {
    makeRequest('PUT', 'USER_PROFILE_SETHANDLE', { token, handleStr })
        .then(({ data }) => {
          console.log(data);
        })
        .catch(err => console.log(err));
  }

  const editable = uId.toString() === profile;

  return (
      <>
        <Typography variant="h4">Profile</Typography>
        {loading
            ? <Placeholder/>
            : (
                <List subheader={<ListSubheader>Profile Details</ListSubheader>}>
                  <ListItem key={'name'}>
                    <EditableFields
                        editable={editable}
                        masterValue={profileDetails.nameLast}
                        slaveValues={[profileDetails.nameFirst]}
                        master={passedProps => <TextField label={'Last Name'} {...passedProps}/>}
                        slaves={[passedProps => <TextField label={'First Name'} {...passedProps}/>]}
                        onSave={updateName}
                    />
                  </ListItem>
                  <ListItem key={'email'}>
                    <EditableFields
                        editable={editable}
                        masterValue={profileDetails.email}
                        master={passedProps => <TextField label={'Email'} {...passedProps}/>}
                        onSave={updateEmail}
                    />
                  </ListItem>
                  <ListItem key={'handle'}>
                    <EditableFields
                        editable={editable}
                        masterValue={profileDetails.handleStr}
                        master={passedProps => <TextField label={'Handle'} {...passedProps}/>}
                        onSave={updateHandle}
                    />
                  </ListItem>
                  <ListItem key={'imgUrl'}>
                    <EditableFields
                        editable={editable}
                        masterValue={profileDetails.profileImgUrl}
                        master={passedProps => (
                            <TextField label={'imgUrl,x1,y1,x2,y2'} {...passedProps}/>
                        )}
                        onSave={updateProfileImgUrl}
                    />
                  </ListItem>
                  <br/>
                  <div>
                    NOTE: The final field input is to set a profile image. Please enter the 5
                    components (image url, xStart, yStart, xEnd, yEnd) separated by commas.
                  </div>
                </List>
            )}
        <br/>
        {editable && <UserStats/>}
      </>
  );
}

export default Profile;
