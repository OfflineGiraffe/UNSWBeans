import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  Link,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core';
import DeveloperOutlinedIcon from '@material-ui/icons/DeveloperModeOutlined';
import React from 'react';
import Placeholder from '../components/Placeholder';
import { makeRequest } from '../utils/axios_wrapper';

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.primary.light,
    },
  },
  card: {
    backgroundColor: theme.palette.background.paper,
    marginTop: theme.spacing(8),
    padding: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: theme.shape.borderRadius,
  },
}));

function RegisterPage({ setAuth, ...props }) {
  const [loading, setLoading] = React.useState(false);
  const [values, setValues] = React.useState({
    nameFirst: '',
    nameLast: '',
    email: '',
    password: '',
  });

  const handleChange = name =>
      event => {
        setValues({ ...values, [name]: event.target.value });
      };

  function handleSubmit(event) {
    event.preventDefault();

    // Quick validation
    if (!values.email || !values.password) {
      return;
    }

    setLoading(true);

    // Send to backend
    makeRequest('POST', 'AUTH_REGISTER', { ...values })
        .then(response => {
          console.log(response);
          const data = response.data;
          setAuth(data.token, data.authUserId);
          props.history.push('/');
        })
        .catch(err => console.log(err))
        .finally(() => setLoading(false));
  }

  const classes = useStyles();

  return (
      <Container component="main" maxWidth="sm">
        <Box boxShadow={3} className={classes.card}>
          <Avatar>
            <DeveloperOutlinedIcon color="secondary"/>
          </Avatar>
          <Typography component="h1" variant="h5">Register</Typography>
          {loading
              ? (
                  <div style={{ marginTop: '64px' }}>
                    <Placeholder/>
                  </div>
              )
              : (
                  <form noValidate onSubmit={handleSubmit}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="nameFirst"
                        label="First name"
                        name="nameFirst"
                        type="text"
                        autoFocus
                        value={values.nameFirst}
                        onChange={handleChange('nameFirst')}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="nameLast"
                        label="Last name"
                        name="nameLast"
                        type="text"
                        value={values.nameLast}
                        onChange={handleChange('nameLast')}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange('email')}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={values.password}
                        onChange={handleChange('password')}
                    />
                    <div className="password-warning">
                      Passwords are not securely stored.
                      <br/>
                      Do not enter any currently used passwords.
                    </div>
                    <Button type="submit" fullWidth variant="contained" color="primary">
                      Sign Up
                    </Button>
                    <Grid container>
                      <Grid item>
                        <br/>
                        <Link href="/login" variant="body1">
                          {'Already have an account? Login'}
                        </Link>
                      </Grid>
                    </Grid>
                  </form>
              )}
        </Box>
      </Container>
  );
}

export default RegisterPage;
