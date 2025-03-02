import AisDecoder from 'ais-stream-decoder';
import mqtt from 'mqtt';
import config from './config.json' with { type: "json" };
//import config from './config.json' with { assert: "json" };

// ------ AIS Decoder --------
const decoder = new AisDecoder.default();
decoder.on('error', console.error);
decoder.on('data', message => {
    const data = JSON.parse(message);
    console.log(data.mmsi);
    client.publish(`/ship/${data.mmsi}`, message, { qos: 0, retain: false }, console.error);
});

// ----- MQTT -------
const connectUrl = `${config.protocol}://${config.host}:${config.port}`;
const topic = `/sensor/#`

const client = mqtt.connect(connectUrl, {
    clientId: config.client_id,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
});

client.on('connect', () => {
    console.log(`Connected to ${connectUrl} as ${config.client_id}`);

    client.subscribe([topic], () => {
        console.log(`Subscribed to topic ${topic}`);
    });

    client.on('message', (_, payload) => {
        const data = payload.toString().trim().split('\r\n');
        for(const m of data){
            decoder.write(m);
        }
    });
});