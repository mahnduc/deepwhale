'use client';

import { createContext, useContext } from 'react';

type UserContextType = {
  userName: string;
};

export const UserContext = createContext<UserContextType>({
  userName: '',
});

export const useUser = () => useContext(UserContext);