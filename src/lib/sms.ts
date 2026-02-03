
type SendSMSInput = {
  to: string;
  message: string;
  from?: string;
};

const tokenID = process.env.TOUCHSMS_TOKEN_ID;
const accessToken = process.env.TOUCHSMS_ACCESS_TOKEN;
const defaultSender = process.env.TOUCHSMS_DEFAULT_SENDER || "SkyTrips";

/**
 * Sends an SMS using touchSMS API v2
 * @param input - { to: recipient number, message: content, from: optional sender ID }
 * @returns - API response data
 */
export async function sendSMS(input: SendSMSInput) {
  if (!tokenID || !accessToken) {
    console.error("touchSMS credentials missing (Token ID or Access Token)");
    throw new Error("SMS configuration missing");
  }

  try {
    // touchSMS API requires Basic Auth with AccessToken as username and TokenID as password
    const auth = Buffer.from(`${accessToken}:${tokenID}`).toString("base64");
    
    const payload = {
      messages: [
        {
          to: input.to,
          from: input.from || defaultSender,
          body: input.message,
        },
      ],
    };

    console.log(`Attempting to send SMS to ${input.to} via touchSMS...`);

    const response = await fetch("https://app.touchsms.com.au/api/v2/sms", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`touchSMS API Error: ${response.status} ${response.statusText} - ${errText}`);
    }

    const data = await response.json();
    console.log("touchSMS Message sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to send SMS via touchSMS:", error);
    throw error;
  }
}

export async function sendOTPSMS(data: { phone: string; otp: string; type: "signup" | "reset_password" }) {
  const isSignup = data.type === "signup";
  const message = isSignup 
    ? `Your SkyTrips verification code is: ${data.otp}. Valid for 10 minutes.`
    : `Your SkyTrips password reset code is: ${data.otp}. Valid for 10 minutes.`;

  return await sendSMS({
    to: data.phone,
    message,
  });
}
