import { createContext, Dispatch, SetStateAction, useState } from 'react';

type Socket = any; 

// Define the context interface
interface SocketContextInterface {
  socket: Socket | null;
  setSocket: Dispatch<SetStateAction<Socket | null>>;
}

// Define the default state for the context
const defaultSocketState: SocketContextInterface = {
  socket: null,
  setSocket: () => {},
};

// Create the SocketContext
export const SocketContext = createContext(defaultSocketState);

// Create the SocketProvider component
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  return (
    <SocketContext.Provider value={{ socket, setSocket }}>
      {children}
    </SocketContext.Provider>
  );
};