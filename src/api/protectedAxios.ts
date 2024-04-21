import axios from 'axios';
import { decrypt } from '@/utils/cryptography';

const ProtectedAxios = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });


// Before making request to backend, add session details in request
ProtectedAxios.interceptors.request.use(
    (config) => {

        let session_id

        //get the encrypted session details
        const encryptedData = localStorage.getItem('odoo-room-booking-session')

        //decrypt the session details
        const decryptedData = decrypt(encryptedData)

        // check if decryptedData is valid
        if (JSON.parse(decryptedData)?.session_id) {
            session_id = JSON.parse(decryptedData).session_id
        }

        if (session_id) {
            config.headers["authorization"] = 'Bearer ' + session_id;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);



// Intercept the response from server to check for session expiry error
ProtectedAxios.interceptors.response.use(
    (res) => {
        return res;
    },
    async (err) => {
        let session_id

        //get the encrypted session details
        const encryptedData = localStorage.getItem('odoo-room-booking-session')

        //decrypt the session details
        const decryptedData = decrypt(encryptedData)

        // check if decryptedData is valid
        if (JSON.parse(decryptedData)?.session_id) {
            session_id = JSON.parse(decryptedData).session_id
        }

        const originalConfig = err.config;

        if (err.response) {
            if (err.response.status === 498 && !originalConfig._retry && session_id) {    // session expired
                // handle infinite loop
                originalConfig._retry = true;

                try {
                    // delete the current session and reload window to get a new session
                    localStorage.removeItem('odoo-room-booking-session')
                    window.location.reload()
                } catch (_error) {
                    return Promise.reject(_error);
                }
            }
        }
        return Promise.reject(err);
    }
);


export default ProtectedAxios;
