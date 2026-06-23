import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

console.log('🔌 Initializing Laravel Echo...');

// Get the auth token from localStorage
const getAuthToken = () => localStorage.getItem('auth_token');

const echo = new Echo({
    broadcaster: 'reverb',
    key: 'oriotel1_reverb_key',
    wsHost: 'localhost',
    wsPort: 8095, // Port exposé par Reverb dans docker-compose
    wssPort: 8095,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: 'http://localhost:8090/api/communication/broadcasting/auth',
    auth: {
        headers: {
            'Authorization': getAuthToken() ? `Bearer ${getAuthToken()}` : '',
            'Accept': 'application/json'
        }
    },
    // Add logging for debugging
    logger: (msg) => console.log('📡 Echo:', msg),
});

// Log connection events
echo.connector.pusher.connection.bind('state_change', (states) => {
    console.log('🔌 Echo state change:', states);
});

echo.connector.pusher.connection.bind('connected', () => {
    console.log('✅ Echo connected to Reverb!');
});

echo.connector.pusher.connection.bind('disconnected', () => {
    console.log('❌ Echo disconnected');
});

echo.connector.pusher.connection.bind('error', (error) => {
    console.error('❌ Echo error:', error);
});

// Update auth headers when token changes (optional, but helpful)
export const updateEchoAuthToken = () => {
    const token = getAuthToken();
    echo.options.auth.headers.Authorization = token ? `Bearer ${token}` : '';
    console.log('🔑 Updated Echo auth token');
};

export default echo;