import type { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import Head from 'next/head';
import appTheme from '../util/theme';
import { CssBaseline, Grow } from '@mui/material';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { AuthProvider } from "../contexts/auth";
import GlobalProvider from "../contexts/global";
import '../styles/globals.css'
import DateAdapter from "@mui/lab/AdapterDateFns";

function MyApp({Component, pageProps}: AppProps) {
  return (
      <div className="app-root">
        <Head>
          <meta name="viewport" content="initial-scale=1, width=device-width"/>
        </Head><SnackbarProvider
          maxSnack={5}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          TransitionComponent={Grow as React.ComponentType}
      >
        <LocalizationProvider dateAdapter={DateAdapter}>
        <AuthProvider>
          <GlobalProvider>
            <ThemeProvider theme={appTheme}>
              <CssBaseline/>
                <Component {...pageProps} />
            </ThemeProvider>
          </GlobalProvider>
        </AuthProvider>
        </LocalizationProvider>
      </SnackbarProvider>
      </div>
  );
}

export default MyApp;
