const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require('@whiskeysockets/baileys');

const readline = require('readline');

async function startBot() {

    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        auth: state
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ connection, qr }) => {

        if (connection === 'open') {
            console.log('🤖 Zev Bot conectado');
        }

        if (connection === 'close') {
            console.log('❌ Conexión cerrada');
        }

    });

    if (!state.creds.registered) {

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('📱 Número (ejemplo 51999999999): ', async (number) => {

            try {

                const code = await sock.requestPairingCode(number);

                console.log(`\n🔑 Tu código: ${code}\n`);

            } catch (err) {

                console.log('❌ Error generando código');

            }

            rl.close();

        });

    }

    sock.ev.on('messages.upsert', async ({ messages }) => {

        const msg = messages[0];

        if (!msg.message) return;

        const text = msg.message.conversation || '';

        if (text === '.menu') {

            await sock.sendMessage(msg.key.remoteJid, {
                text: '🤖 Hola soy Zev Bot\nEstoy en desarrollo ⚙️'
            });

        }

    });

}

startBot();
