import { useContext, useEffect, useState } from 'react'
import '@/App.css'
import Logo from '@/components/ui/logo'
import { LoaderCircle } from 'lucide-react'
import Axios from '@/api/axios'
import Rooms from '@/components/Rooms'
import { Toaster } from '@/components/ui/toaster'
import io from 'socket.io-client';
import { SessionContext } from '@/context/SessionProvider'
import { SocketContext } from '@/context/SocketProvider'



function App() {
  const [authenticating, setAuthenticating] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  const { session, setSession } = useContext(SessionContext)
  const { setSocket } = useContext(SocketContext)

  useEffect(() => {
    authenticateSession()
  }, [])


  // checks whether user have an access token saved in local storage
  const authenticateSession = () => {
    setAuthenticating(true)
    setAuthenticated(true)

    if (session?.session_id) {  // authenticated user
      setAuthenticating(false)

    } else { // get a new session for the user
      Axios.get("/api/auth/session/new")
        .then(res => {
          if (res.data.sessionId) {
            setSession({ session_id: res.data.sessionId })
            setAuthenticating(false)
            setAuthenticated(true)
          }
        })
        .catch(err => {
          console.log(err);
          setAuthenticating(false)
        })
    }
  }


  useEffect(() => {
    if (session?.session_id) {
      
      let _socket = io(import.meta.env.VITE_API_BASE_URL, {
        transports: ["polling"],
        query: {
          id: session.session_id
        }
      });

      setSocket(_socket)
    }
  }, [session])



  return (
    <>
      <Toaster />

      <nav className='container py-6'>
        <Logo />
      </nav>

      <main>
        {authenticating
          ?
          <section id="authenticate-loader" className='w-full h-[80dvh] flex items-center justify-center'><LoaderCircle className='animate-spin' size={35} /></section>

          :
          !authenticated
            ?
            <section id="authenticate-loader" className='w-full h-[80dvh] flex flex-col items-center justify-center'>
              <h2 className='text-xl font-medium'>Server down</h2>
              <p className='text-destructive'>Could not authenticate at the moment.</p>
            </section>

            : <Rooms />
        }
      </main>

      <footer>
      </footer>
    </>
  )
}

export default App
