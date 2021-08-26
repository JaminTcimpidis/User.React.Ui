import * as React from 'react';
import { AuthClient } from './authClient';

export const AuthContext = React.createContext<AuthClient | null>(null);