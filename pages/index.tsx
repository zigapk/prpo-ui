import { AppBar, Box, Button, Card, Container, Grid, Toolbar, Typography } from '@mui/material';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useSnackbar } from 'notistack';
import { useContext, useEffect, useState } from "react";
import { handleApiError, privateAxios } from "../util/api";
import { useRouter } from "next/router";
import { AuthContext } from "../contexts/auth";
import { route } from "next/dist/server/router";

const Home: NextPage = () => {
  const {enqueueSnackbar} = useSnackbar();
  const authContext = useContext(AuthContext);

  const [chargers, setChargers] = useState(null);

  const getChargersPage = (offset: number) => {
    privateAxios.get('char/chargers').then(() => {
      console.log('done');
    }).catch(reason => handleApiError(reason, enqueueSnackbar));
  }

  const getChargers = () => {
    getChargersPage(0);
  }

  useEffect(getChargers, [
    getChargers,
  ]);

  const router = useRouter();

  return (
      <>
        <Head>
          <title>PRPO Chargers</title>
        </Head>

        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
              Chargers
            </Typography>
            <Button color="inherit" onClick={() => {
              authContext.logout();
              router.replace('/auth/sign_in').then()
            }}>Logout</Button>
          </Toolbar>
        </AppBar>

        <Box py={5}>
          <Container>
            <Grid container justifyContent="center">
              <Grid item xs={3}>
                <Card variant="outlined">
                  <Box p={2}>
                    <Typography>Text</Typography>
                    <Button
                        variant="contained"
                        onClick={() => enqueueSnackbar('This is a message!')}
                    >
                      snackbar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() =>
                            enqueueSnackbar('This is a success message!', {
                              variant: 'success',
                            })
                        }
                    >
                      success
                    </Button>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </>
  );
};

export default Home;
