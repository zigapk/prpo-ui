import React, { createContext, useCallback, useEffect, useState } from 'react';

import { AppAuthState, IAuthContext, IAuthState, IUser, userDefaultData } from '../interfaces';
import jwtDecode from 'jwt-decode';
import { API, publicAxios } from '../util/api';
import useWindowFocus from 'use-window-focus';
import { accessTokenRefreshMargin, refreshTokenRefreshMargin, tokenRefreshInterval } from '../util/constants';
import { useRouter } from 'next/router';

const authStateDefaultData: IAuthState = {
    user: userDefaultData,
};

const authContextDefaultData: IAuthContext = {
    authState: authStateDefaultData,
    setAuthState: () => null,
    logout: () => null,
};

// Check if token will be valid for next safetyMarginInSeconds seconds.
const isTokenValid = (token: string | null, safetyMarginInSeconds = 0): boolean => {
    if (!token) {
        return false;
    }
    let decoded: { exp: number };

    try {
        decoded = jwtDecode(token);
    } catch (e) {
        return false;
    }
    return new Date().getTime() <= (decoded.exp - safetyMarginInSeconds) * 1000;
};

export const getToken = (): string | null => {
    return localStorage.getItem('token') ?? null;
}
const getRefreshToken = (): string | null => localStorage.getItem('refreshToken') ?? null;

export const isAuthenticated = (): AppAuthState => {
    const token = getToken();
    const refreshToken = getRefreshToken();

    // Check if user is logged in and will be logged in for the next 2 * token refresh interval seconds
    // (so token will definetly be refreshed).
    if (isTokenValid(token, tokenRefreshInterval * 2) && isTokenValid(refreshToken, tokenRefreshInterval * 2)) {
        // Logged in, no problem.
        return AppAuthState.LoggedIn;
    } else if (token == null || token === '') {
        // Token is null, user was logged out.
        return AppAuthState.LoggedOut;
    } else if (isTokenValid(refreshToken, refreshTokenRefreshMargin)) {
        // If refresh token is still valid for some time, we will load new access token (another function will take care of that)
        // During that, loading.
        return AppAuthState.Loading;
    } else {
        // Else invalid refresh token, logout user.
        console.log('Clear because token invalid.')
        // clearUserInfo();
        return AppAuthState.LoggedOut;
    }
};

export function clearUserInfo(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
}

const AuthContext = createContext<IAuthContext>(authContextDefaultData);

type Props = {
    children?: React.ReactNode;
};

const AuthProvider = ({ children }: Props): JSX.Element => {
    const [authState, setAuthState] = useState(authStateDefaultData);
    const windowFocused = useWindowFocus();
    const { pathname } = useRouter();

    const setAuthInfo = (value: { refreshToken?: string; token: string; userData?: IUser }) => {
        if (isTokenValid(value.token, tokenRefreshInterval)) {
            // Save access token to cookies.
            localStorage.setItem('token', value.token ?? '');
        }
        if (isTokenValid(value.refreshToken || 'prazn token', tokenRefreshInterval)) {
            // Save refresh token to localstorage
            localStorage.setItem('refreshToken', value.refreshToken ?? '');
        }
        // Set state
        if (value.userData) {
            setAuthState({ user: value.userData });
        }
    };

    const getNewTokenFromRefreshToken = useCallback(() => {
        publicAxios
            .post(
                'auth/authorize/',
                {
                    type: 'token',
                    refresh: getRefreshToken(),
                },
                {
                    baseURL: API,
                },
            )
            .then((response: any) => {
                setAuthInfo({
                    token: response.data.access,
                    userData: userDefaultData,
                });
                console.log('Token refreshed.');
            })
            .catch(() => {
                console.log('Refreshing token failed, loggin user out.');
                logout();
            });
    }, []);

    const refreshTokenIfNeeded = useCallback(() => {
        if (isAuthenticated() === AppAuthState.LoggedOut) {
            return;
        }

        const token = getToken();
        const refreshToken = getRefreshToken();

        if (!isTokenValid(refreshToken, refreshTokenRefreshMargin)) {
            // Logout if refresh token is expired or is about to expire in the next 10 seconds.
            console.log('about to expire')
            logout();
        } else if (!isTokenValid(token, accessTokenRefreshMargin)) {
            // Token is either expired or is about to expire in the next 5 days, refresh it.
            getNewTokenFromRefreshToken();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getNewTokenFromRefreshToken, windowFocused, pathname]);

    useEffect(() => {
        // Refresh token once on component mount.
        refreshTokenIfNeeded();

        // refresh token interval
        setInterval(() => {
            refreshTokenIfNeeded();
        }, tokenRefreshInterval * 1000);
    }, [refreshTokenIfNeeded]);

    const logout = () => {
        console.log('Logging out user');
        clearUserInfo();
        setAuthState(authStateDefaultData);
    };

    return (
        <AuthContext.Provider
            value={{
        authState,
            setAuthState: setAuthInfo,
            logout,
    }}
>
    {children}
    </AuthContext.Provider>
);
};

export { AuthContext, AuthProvider, isTokenValid };