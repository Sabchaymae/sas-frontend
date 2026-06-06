import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: 'oriotel1_reverb_key',
    wsHost: 'localhost',
    wsPort: 8095, // Port exposé par Reverb dans docker-compose
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
});

export default echo;