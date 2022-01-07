import React, { useContext, useEffect } from 'react';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { useRouter } from 'next/router';
import { publicAxios } from "../../util/api";
import { useSnackbar } from "notistack";
import { AuthContext, isAuthenticated } from "../../contexts/auth";
import { AppAuthState } from "../../interfaces";
import { Box, Button, Card, Grid, TextField, Typography } from "@mui/material";

interface SignInFormFields {
  email: string;
  password: string;
}

const emptyFormValues: SignInFormFields = {
  email: '',
  password: '',
};

const signUpSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
  confirm_password: yup
      .string()
      .oneOf([yup.ref('password'), null], 'Passwords must match'),
});

const SignUp = (): JSX.Element => {
  const {enqueueSnackbar} = useSnackbar();
  const router = useRouter();
  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated() === AppAuthState.LoggedIn) {
      router.replace('/').then();
    }
  }, [router, authContext, authContext.authState]);


  return (
      <div>
        <Formik<SignInFormFields>
            initialValues={emptyFormValues}
            validationSchema={signUpSchema}
            onSubmit={async (values) => {

              publicAxios.post('auth/authorize', {
                'type': 'password',
                'email': values.email,
                'password': values.password,
              }).then(response => {
                // Create new auth state.
                const state = {
                  token: response.data.access_token,
                  refreshToken: response.data.refresh_token,
                  userData: {
                    uid: response.data.user_uid,
                  },
                };
                authContext.setAuthState(state);
                router.replace('/');
              }).catch(reason => {
                enqueueSnackbar('Login failed.')
              })
            }}
        >
          {(props) => (
              <Form>
                <Grid container justifyContent='center' direction='column' style={{minHeight: '90vh'}}>
                  <Grid item>
                    <Grid container justifyContent='center' direction='row'>
                      <Grid item xs={12} md={6} lg={4}>
                        <Box p={4}>
                          <Card>
                            <Box p={2}>
                              <Grid container spacing={3} justifyContent='center'>
                                <Grid item xs={12}><Typography variant='h6'>Login</Typography></Grid>
                                <Grid item xs={12}>
                                  <TextField id="email" name="email" type="email" label="Email" variant="outlined"
                                             fullWidth={true}
                                             value={props.values.email}
                                             onChange={props.handleChange}
                                             error={props.touched.email && Boolean(props.errors.email)}
                                             helperText={props.touched.email && props.errors.email}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField id="password" name="password" type="password" label="Password"
                                             variant="outlined" fullWidth={true}
                                             value={props.values.password}
                                             onChange={props.handleChange}
                                             error={props.touched.password && Boolean(props.errors.password)}
                                             helperText={props.touched.password && props.errors.password}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <Button variant='contained' type={'submit'} fullWidth={true}>
                                    Submit
                                  </Button>
                                </Grid>
                              </Grid>

                            </Box>
                          </Card>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Form>
          )}
        </Formik>
      </div>
  );
};

export default SignUp;
