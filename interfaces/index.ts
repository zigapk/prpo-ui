export interface IUser {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    type: string;
}

export interface IAuthState {
    user: IUser;
}

export interface IAuthContext {
    authState: IAuthState;
    setAuthState: (authInfo: { refreshToken: string; token: string; userData?: IUser }) => void;
    logout: () => void;
}

export const userDefaultData: IUser = { id: 0, email: '', firstName: '', lastName: '', type: '' };

export enum AppAuthState {
    Loading,
    LoggedOut,
    LoggedIn,
}

export interface ILoginCredentials {
    email: string;
    password: string;
}