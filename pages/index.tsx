import { AppBar, Box, Button, Card, CircularProgress, Container, Grid, Toolbar, Typography } from '@mui/material';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useSnackbar } from 'notistack';
import { useCallback, useContext, useEffect, useState } from "react";
import { handleApiError, privateAxios } from "../util/api";
import { useRouter } from "next/router";
import { AuthContext } from "../contexts/auth";
import Charger from "../components/Charger";
import { ICharger } from "../interfaces";

const Home: NextPage = () => {
  const {enqueueSnackbar} = useSnackbar();
  const authContext = useContext(AuthContext);

  const [chargers, setChargers] = useState<ICharger[]>([]);
  const [lastPageSize, setLastPageSize] = useState(1000);
  const [loading, setLoading] = useState(true);

  const getChargersPage = useCallback((offset: number) => {
    setLoading(true);
    privateAxios.get(`char/chargers?offset=${offset}`).then(response => {
      setChargers(prevChargers => [...prevChargers, ...response.data]);
      setLastPageSize(response.data.length);
      setLoading(false)
    }).catch(reason => {
      setLoading(false);
      handleApiError(reason, enqueueSnackbar)
    });
  }, [enqueueSnackbar]);

  useEffect(() => {
    getChargersPage(0)
  }, [getChargersPage]);

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
            <Grid container spacing={3}>
              {
                chargers.map(charger =>
                    <Grid item xs={12} md={6} lg={4} key={charger.id}>
                      <Charger charger={charger}/>
                    </Grid>)
              }
              <Grid item xs={12}/>
              {
                loading ? <Grid item>
                  <CircularProgress/>
                </Grid> : null
              }
              {
                !loading && lastPageSize >= 3 ? <Grid item xs={12}>
                  <Grid container direction='row' justifyContent='center'>
                    <Grid item>
                      <Box py={3}>
                        <Button variant='contained' onClick={() => {
                          getChargersPage(chargers.length);
                        }
                        }>
                          Load more
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid> : null
              }
            </Grid>
          </Container>
        </Box>
      </>
  );
};

export default Home;
