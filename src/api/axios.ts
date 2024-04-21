import axios from 'axios';

const Axios = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

export default Axios;
