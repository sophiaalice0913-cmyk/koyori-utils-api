import { X402PaymentVerifierV2 } from "x402-stacks";
import axios from "axios";

async function validateEndpoint() {
  const url = "https://koyori-utils-api.koyori-aibtc.workers.dev/api/hash";
  console.log(`Probing: ${url}`);

  try {
    // Attempt the request using axios to capture the 402 response
    await axios.post(url, { text: "hello" });
    console.error("Error: Expected 402, but the request succeeded.");
  } catch (error: any) {
    if (error.response && error.response.status === 402) {
      console.log("SUCCESS: Received 402 Payment Required.");
      
      // Inspect headers and body manually
      const headers = error.response.headers;
      const body = error.response.data;

      console.log("WWW-Authenticate Header:", headers['www-authenticate']);
      console.log("Parsed Payment Requirements:", JSON.stringify(body, null, 2));

      // Validate mandatory fields based on the body we received
      const required = ['payTo', 'amount', 'tokenType', 'nonce'];
      const missing = required.filter(field => !body[field]);

      if (missing.length === 0) {
        console.log("VALIDATION PASSED: All mandatory x402 fields found in body.");
      } else {
        console.error("VALIDATION FAILED: Missing fields in body:", missing);
      }
      
      if (headers['www-authenticate']) {
         console.log("VALIDATION PASSED: WWW-Authenticate header found.");
      } else {
         console.error("VALIDATION FAILED: WWW-Authenticate header missing.");
      }

    } else {
      console.error("Error: Received unexpected status:", error.response?.status);
      console.error(error);
    }
  }
}

validateEndpoint();
