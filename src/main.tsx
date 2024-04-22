import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '@/index.css'
import { SocketProvider } from '@/context/SocketProvider.tsx'
import { SessionProvider } from '@/context/SessionProvider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <SocketProvider>
    <SessionProvider>
      <App />
    </SessionProvider>
  </SocketProvider>
)
