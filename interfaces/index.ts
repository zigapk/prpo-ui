export interface IUser {
    uid: string;
}

export interface IAuthState {
    user: IUser;
}

export interface IAuthContext {
    authState: IAuthState;
    setAuthState: (authInfo: { refreshToken: string; token: string; userData?: IUser }) => void;
    logout: () => void;
}

export enum AppAuthState {
    Loading,
    LoggedOut,
    LoggedIn,
}

export interface ILoginCredentials {
    email: string;
    password: string;
}

export interface ICharger {
    id: number,
    name: string,
    address: string,
    lat: number,
    lon: number,
    date_created: Date,
}

export interface IReservation {
    id: number,
    charger_id: number,
    user_id: string,
    time_from: string,
    time_until: string,
}