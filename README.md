# 🚨 Red Alert Smart Home Integration (Tzofar to Tuya)

A lightweight Node.js server designed to run 24/7 on a Raspberry Pi. It listens for Israel's Home Front Command (Pikud HaOref) "Early Warnings" (התרעה מקדימה) and automatically flashes a Tuya smart light to alert you *before* the physical sirens sound.

## ✨ Features
* **Zero-Polling Architecture:** Instead of aggressively polling the official API (which often results in IP blocks and high CPU usage), this script uses a reverse-engineered WebSocket handshake to connect to the [Tzofar](https://www.tzevaadom.co.il/) live stream.
* **Instant Push Notifications:** Catches ephemeral "System Messages" that do not appear in the standard public API history.
* **Highly Efficient:** Uses almost zero RAM or CPU. Perfect for running infinitely via PM2 on a Raspberry Pi or an old Android phone (via Termux).
* **Hardware Integrated:** Native connection to the Tuya IoT Cloud API to trigger an emergency 10-second light blinking sequence.
* **Auto-Reset:** Detects 'Incident Ended' (סיום אירוע) messages from the Home Front Command to automatically shut off the emergency lighting once the area is clear."

## 🛠️ Prerequisites
1. **Node.js** installed on your machine/server.
2. A **Tuya Developer Account**: You need to create a free Cloud project on the [Tuya IoT Platform](https://iot.tuya.com/) and link your Smart Life / Tuya app to get your API keys.
3. Your specific Tuya **Device ID** (the light/switch you want to control).

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MatanKarmazin/red-alert-light.git
   cd red-alert-light
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```


3. **Configure your environment variables:**
Copy the example environment file and add your actual Tuya credentials.  
*Do not share your `.env` file or upload it to GitHub!*

## ⚙️ Configuration (Setting your City/Zone)

By default, the script is configured to trigger the lights if the warning mentions "דן" (Dan), "השפלה" (Shfela), or "ראשון לציון" (Rishon LeZion).

To change this to your location, open `index.js` and modify the `isMyArea` variable on line 66:

```javascript
const isMyArea = body.includes("YOUR_REGION") || body.includes("YOUR_CITY");

```

## 🏃‍♂️ Usage

**To test the Tuya light sequence:**

```bash
npm run test

```

*(This will flash your light on and off for 10 seconds to confirm your API keys are working).*

**To start the live listener:**

```bash
npm start

```

### Running 24/7 with PM2 (Recommended)

If you are running this on a Raspberry Pi, it is highly recommended to use `pm2` so the script runs in the background and restarts automatically if your device reboots.

```bash
npm install -g pm2
pm2 start index.js --name "RedAlertListener"
pm2 save
pm2 startup

```

## ⚠️ Disclaimer

**This project is for educational and supplementary purposes only.** APIs can change, websockets can drop, and home internet connections can fail. **DO NOT** rely solely on this script for life-saving alerts. Always ensure you have the official Home Front Command app installed and can hear the physical municipal sirens.

## 📄 License

This project is open-source and available under the MIT License. Feel free to fork, modify, and improve it to keep your family safe.
