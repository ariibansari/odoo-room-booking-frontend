import { useEffect, useState } from 'react'
import './App.css'
import Logo from './components/ui/logo'
import { LoaderCircle } from 'lucide-react'
import Axios from '@/api/axios'
import Rooms from '@/components/Rooms'
import { Toaster } from '@/components/ui/toaster'
import { decrypt, encrypt } from '@/utils/cryptography'



function App() {
  const [authenticating, setAuthenticating] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)


  useEffect(() => {
    authenticateSession()
  }, [])


  // checks whether user have an access token saved in local storage
  const authenticateSession = () => {
    setAuthenticating(true)
    setAuthenticated(true)

    let session_id
    const session = localStorage.getItem("odoo-room-booking-session")

    if (session) {
      //get the encrypted session details
      const encryptedData = localStorage.getItem('odoo-room-booking-session')
      console.log(encryptedData);

      //decrypt the session details
      const decryptedData = decrypt(encryptedData)
      console.log(decryptedData);

      // check if decryptedData is valid
      if (JSON.parse(decryptedData)?.session_id) {
        session_id = JSON.parse(decryptedData).session_id
      }
    }

    if (session_id) {  // authenticated user
      setAuthenticating(false)

    } else { // get a new session for the user
      Axios.get("/api/auth/session/new")
        .then(res => {
          if (res.data.sessionId) {
            localStorage.setItem("odoo-room-booking-session", encrypt(JSON.stringify({ session_id: res.data.sessionId })))
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
