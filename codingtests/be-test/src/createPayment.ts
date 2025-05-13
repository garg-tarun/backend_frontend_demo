import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { buildResponse, parseInput } from "./lib/apigateway";
import { createPayment, Payment, PaymentRequestType } from "./lib/payments";
import { v4 as uuidv4 } from "uuid";
import { validatePaymentRequest } from "./validators/requestValidator";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const paymentReq = parseInput(event.body || "{}") as PaymentRequestType;

  // Question 4: checking for input request schema
  if (!validatePaymentRequest(paymentReq)) {
    let error_msg = "";
    if (validatePaymentRequest.errors && validatePaymentRequest.errors[0]) {
      error_msg = validatePaymentRequest.errors[0].message ?? "";
    }
    return buildResponse(422, { message: error_msg });
  }

  // Question 2: adding support of adding a unique id instead of
  // accepting it from user
  const payment = { ...paymentReq, id: uuidv4() };
  await createPayment(payment);
  return buildResponse(201, { result: payment.id });
};
