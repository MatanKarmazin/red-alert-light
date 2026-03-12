require('dotenv').config();
const WebSocket = require('ws');
const { TuyaContext } = require("@tuya/tuya-connector-nodejs");

// --- TUYA CONFIGURATION ---
const tuya = new TuyaContext({
  baseUrl: "https://openapi.tuyaeu.com",
  accessKey: process.env.ACCESS_KEY,
  secretKey: process.env.SECRET_KEY,
});
const DEVICE_ID = process.env.DEVICE_ID;

// --- SAFETY LOCK & TIMEOUT ---
let isTriggering = false; 
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- 10-SECOND BLINK SEQUENCE ---
async function triggerAlarmSequence() {
  if (isTriggering) return; 
  isTriggering = true;

  console.log(`\n[${new Date().toLocaleTimeString()}] 🚨 EARLY WARNING DETECTED! Starting 10-second blink...`);

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

    console.log(`[${new Date().toLocaleTimeString()}] 💡 10 seconds passed. Locking LED to ON.`);
    await tuya.request({
      method: "POST",
      path: `/v1.0/iot-03/devices/${DEVICE_ID}/commands`,
      body: { commands: [{ code: "switch_led", value: true }] }
    });

  } catch (error) {
    console.error("❌ Tuya Sequence Error:", error.message);
  }

  setTimeout(() => { isTriggering = false; }, 5000); 
}

// --- WEBSOCKET CONNECTION ---
function startSirenListener() {
  console.log("🛡️ Starting Early Warning Listener...");
  
  const ws = new WebSocket("wss://ws.tzevaadom.co.il/socket?platform=WEB", {
    headers: {
      "Origin": "https://www.tzevaadom.co.il",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
  });

  ws.on('open', () => {
    console.log("✅ Connected! Monitoring for Early Warnings in Dan/Shfela...");
  });

  ws.on('message', (data) => {
    const payloadString = data.toString();
    
    if (payloadString === "pong" || payloadString === "ping" || payloadString.length < 10) return;
    
    try {
        const payload = JSON.parse(payloadString);
        
        if (payload.type === "SYSTEM_MESSAGE" && payload.data) {
            const title = payload.data.titleHe || "";
            const body = payload.data.bodyHe || "";
            
            const isEarlyWarning = title.includes("התרעה מקדימה") || body.includes("בדקות הקרובות");
            const isMyArea = body.includes("דן") || 
                             body.includes("השפלה") || 
                             body.includes("שפלה") ||
                             body.includes("ראשון לציון");

            if (isEarlyWarning && isMyArea) {
                console.log(`\n[${new Date().toLocaleTimeString()}] 📡 Message Received: ${body}`);
                triggerAlarmSequence();
            }
        }
    } catch (err) {
        // Ignore invalid JSON errors silently
    }
  });

  ws.on('close', () => {
    console.log("❌ Server closed connection. Reconnecting in 5 seconds...");
    setTimeout(startSirenListener, 5000);
  });

  ws.on('error', (err) => {
    console.error("Network Error:", err.message);
  });
}

startSirenListener();