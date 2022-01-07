import type { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import Head from 'next/head';
import appTheme from '../util/theme';
import { Container, CssBaseline, Grow } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { AuthProvider } from "../contexts/auth";
import GlobalProvider from "../contexts/global";
import '../styles/globals.css'

function MyApp({Component, pageProps}: AppProps) {
  return (
      <>
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
        <AuthProvider>
          <GlobalProvider>
            <ThemeProvider theme={appTheme}>
              <CssBaseline/>
                <Component {...pageProps} />
            </ThemeProvider>
          </GlobalProvider>
        </AuthProvider>
      </SnackbarProvider>
      </>
  );
}

export default MyApp;
