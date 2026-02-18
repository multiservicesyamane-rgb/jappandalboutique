const PAYTECH_API_KEY = process.env.PAYTECH_API_KEY!;
const PAYTECH_SECRET_KEY = process.env.PAYTECH_SECRET_KEY!;
const PAYTECH_API_URL = "https://paytech.sn/api/payment/request-payment";

export interface PayTechPaymentRequest {
  item_name: string;
  item_price: number;
  currency?: string;
  ref_command: string;
  command_name: string;
  env?: string; // "test" or "prod" - default "test"
  success_url: string;
  cancel_url: string;
  ipn_url: string; // Required by PayTech API
  custom_field?: string; // Must be JSON string, not object
  target_payment?: string; // "Wave", "Orange Money", "Carte Bancaire", etc.
}

export interface PayTechPaymentResponse {
  success: number;
  token: string;
  redirect_url: string;
}

/**
 * Initier un paiement PayTech
 * Documentation: https://docs.intech.sn/doc_paytech.php
 */
export async function initiatePayTechPayment(
  request: PayTechPaymentRequest
): Promise<PayTechPaymentResponse> {
  // Build the request body with all required fields
  const body: Record<string, any> = {
    item_name: request.item_name,
    item_price: request.item_price,
    currency: request.currency || "XOF",
    ref_command: request.ref_command,
    command_name: request.command_name,
    env: request.env || "test",
    ipn_url: request.ipn_url,
    success_url: request.success_url,
    cancel_url: request.cancel_url,
  };

  // Add optional fields only if they have values
  if (request.custom_field) {
    body.custom_field = request.custom_field;
  }
  if (request.target_payment) {
    body.target_payment = request.target_payment;
  }

  console.log("[PayTech] Sending payment request:", {
    item_name: body.item_name,
    item_price: body.item_price,
    ref_command: body.ref_command,
    command_name: body.command_name,
    env: body.env,
    target_payment: body.target_payment || "(all methods)",
  });

  const response = await fetch(PAYTECH_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      API_KEY: PAYTECH_API_KEY,
      API_SECRET: PAYTECH_SECRET_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  console.log("[PayTech] API response:", {
    success: data.success,
    hasToken: !!data.token,
    hasRedirectUrl: !!(data.redirect_url || data.redirectUrl),
    message: data.message,
    error: data.error,
  });

  if (data.success !== 1) {
    const errorMsg = data.message || data.error?.join(", ") || "Unknown PayTech error";
    throw new Error(`PayTech API error: ${errorMsg}`);
  }

  return {
    success: data.success,
    token: data.token,
    redirect_url: data.redirect_url || data.redirectUrl,
  };
}

/**
 * Vérifier le statut d'un paiement PayTech
 */
export async function checkPayTechPaymentStatus(token: string) {
  const response = await fetch(
    `https://paytech.sn/api/payment/check/${token}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        API_KEY: PAYTECH_API_KEY,
        API_SECRET: PAYTECH_SECRET_KEY,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `PayTech status check error: ${response.status} - ${errorText}`
    );
  }

  return await response.json();
}
