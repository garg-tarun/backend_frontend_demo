import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { buildResponse } from "./lib/apigateway";
import { listPayments } from "./lib/payments";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Question 5: add ability to query payments based on currency parameter
  // fetch currency query paramter
  try {
    const currency = event.queryStringParameters?.currency;

    if (currency && !/^[A-Z]{3}$/.test(currency)) {
      return buildResponse(400, { message: "Invalid currency code" });
    }

    const payments = await listPayments(currency?.toUpperCase());
    return buildResponse(200, { data: payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return buildResponse(500, {
      message: "Internal Server Error while fetching list of payments",
    });
  }
};
