import React, { createContext, useEffect, useState } from 'react';
import {
  AppAuthState,
} from '../interfaces';

import { isAuthenticated } from './auth';
import { useAxios } from '../util/api';

export interface IGlobalState {
  isLoading: boolean;
}

export interface IGlobalContext {
  globalState: IGlobalState;
  setGlobalState: (globalState: IGlobalState) => void;
}

const globalStateDefaultData: IGlobalState = {
  isLoading: true,
};

const globalContextDefaultData: IGlobalContext = {
  globalState: globalStateDefaultData,
  setGlobalState: () => null,
};

const GlobalContext = createContext<IGlobalContext>(globalContextDefaultData);

type Props = {
  children?: React.ReactNode;
};

const GlobalProvider = ({children}: Props): JSX.Element => {
  const [globalState, setGlobalState] = useState<IGlobalState>(globalStateDefaultData);
  const [{data: signingKeyData, loading: signingKeyLoading, error: signingKeyError}, refetchSigningKey] =
      useAxios('auth/signing_key');

  useEffect(() => {
    if (isAuthenticated() === AppAuthState.LoggedIn) {
      refetchSigningKey().catch((reason: any) => console.error('Loading user data failed.', reason));
    }
  }, [refetchSigningKey]);

  return (
      <GlobalContext.Provider
          value={{
            globalState,
            setGlobalState,
          }}
      >
        {children}
      </GlobalContext.Provider>
  );
};

export default GlobalProvider