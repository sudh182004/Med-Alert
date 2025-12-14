import express from "express";
import cors from "cors";
import twilio from "twilio";

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Set Twilio Credentials
const accountSid = "yoursid";
const authToken = "yourtoken";
const client = twilio(accountSid, authToken);

// 🏥 Dummy Hospital Data
const HOSPITAL_NAME = "Kamal Hospital";
const HOSPITAL_LOCATION = "https://maps.google.com/?q=28.676847,77.501205"; // dummy delhi NCR

app.post("/send-sos", async (req, res) => {
  try {
    const { userName, userLocationLink, emergencyNumber } = req.body;

    const messageBody =
      `🚨 *SOS ALERT*\n` +
      `👤 Name: ${userName}\n` +
      `🌍 User Location: ${userLocationLink}\n\n` +
      `🏥 Nearest Hospital: ${HOSPITAL_NAME}\n📌 ${HOSPITAL_LOCATION}\n\n` +
      `⚠️ Please respond immediately!`;

    await client.messages.create({
      body: messageBody,
        to: 'whatsapp:+number',
      from: "whatsapp:+number"
    });

    res.json({ success: true, message: "SMS Sent!" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to send SOS" });
  }
});

app.listen(3000, () => console.log("🚑 SOS Server running on Port 3000"));
