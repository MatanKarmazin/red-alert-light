require('dotenv').config();
const { TuyaContext } = require("@tuya/tuya-connector-nodejs");

const tuya = new TuyaContext({
  baseUrl: "https://openapi.tuyaeu.com",
  accessKey: process.env.ACCESS_KEY,
  secretKey: process.env.SECRET_KEY,
});
const DEVICE_ID = process.env.DEVICE_ID; 

let isTriggering = false; 
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function triggerAlarmSequence() {
  if (isTriggering) return; 
  isTriggering = true;

  console.log(`[${new Date().toLocaleTimeString()}] 🚨 Test Started: Blinking LED for 10 seconds...`);

  try {
    for (let i = 0; i < 5; i++) {
      await tuya.request({
        method: "POST",
        path: `/v1.0/iot-03/devices/${DEVICE_ID}/commands`,
        body: { commands: [{ code: "switch_led", value: true }] }
      });
      await sleep(1000);

      await tuya.request({
        method: "POST",
        path: `/v1.0/iot-03/devices/${DEVICE_ID}/commands`,
        body: { commands: [{ code: "switch_led", value: false }] }
      });
      await sleep(1000);
    }

    console.log(`[${new Date().toLocaleTimeString()}] 💡 10 seconds passed. Keeping LED ON.`);
    await tuya.request({
      method: "POST",
      path: `/v1.0/iot-03/devices/${DEVICE_ID}/commands`,
      body: { commands: [{ code: "switch_led", value: true }] }
    });

    console.log("✅ Test Complete!");

  } catch (error) {
    console.error("❌ Tuya Sequence Error:", error.message);
  }

  isTriggering = false; 
}

triggerAlarmSequence();