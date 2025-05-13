import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { buildResponse, parseInput } from "./lib/apigateway";
import { getPayment, Payment } from "./lib/payments";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Question 1: Implement the handler
  const paymentId = event.pathParameters?.id;
  if (!paymentId) {
    return buildResponse(400, { message: "Missing payment ID in URL path" });
  }

  const paymentDetails = await getPayment(paymentId);

  // Question 3: return 404, matching payment is not found
  if (!paymentDetails) {
    return buildResponse(404, {
      message: `Invalid payment ID: ${paymentId}`,
    });
  }

  return buildResponse(200, paymentDetails);
};
