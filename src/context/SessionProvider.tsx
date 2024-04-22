import { decrypt, encrypt } from '@/utils/cryptography';
import { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react';

type Session = {
  session_id: number
};

// Define the context interface
interface SessionContextInterface {
  session: Session | null;
  setSession: Dispatch<SetStateAction<Session | null>>;
}

// Define the default state for the session
const defaultSessionState: SessionContextInterface = {
  session: null,
  setSession: () => { },
};

// Create the SessionContext
export const SessionContext = createContext(defaultSessionState);

// Create the SessionProvider component
export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (localStorage.getItem('odoo-room-booking-session')) {

      // fetching the encrypted data
      const encryptedData = localStorage.getItem('odoo-room-booking-session')

      // decrypt the data
      const decryptedData = decrypt(encryptedData)

      // check if data is valid, if, then save in state
      if (JSON.parse(decryptedData)?.session_id) {
        const sessionData = JSON.parse(decryptedData);
        setSession(sessionData);
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('odoo-room-booking-session', encrypt(JSON.stringify(session)));
  }, [session])

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
};