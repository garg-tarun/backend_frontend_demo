import * as payments from "../src/lib/payments";
import { randomUUID } from "crypto";
import { handler } from "../src/getPayment";
import { APIGatewayProxyEvent } from "aws-lambda";

describe("When the user requests the records for a specific payment", () => {
  it("Returns the payment matching their input parameter.", async () => {
    const paymentId = randomUUID();
    const mockPayment = {
      id: paymentId,
      currency: "AUD",
      amount: 2000,
    };
    const getPaymentMock = jest
      .spyOn(payments, "getPayment")
      .mockResolvedValueOnce(mockPayment);

    const result = await handler({
      pathParameters: {
        id: paymentId,
      },
    } as unknown as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(mockPayment);

    expect(getPaymentMock).toHaveBeenCalledWith(paymentId);
  });

  it("Returns 400 error for missing payment id.", async () => {
    const paymentId = randomUUID();
    const expectedError = {
      message: "Missing payment ID in URL path",
    };

    const result = await handler({
      pathParameters: null,
    } as unknown as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual(expectedError);
  });

  it("Returns error with 404 status code for invalid input parameter.", async () => {
    const paymentId = randomUUID();
    const mockPayment = null;
    const expectedError = {
      message: `Invalid payment ID: ${paymentId}`,
    };
    const getPaymentMock = jest
      .spyOn(payments, "getPayment")
      .mockResolvedValueOnce(mockPayment);

    const result = await handler({
      pathParameters: {
        id: paymentId,
      },
    } as unknown as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toEqual(expectedError);

    expect(getPaymentMock).toHaveBeenCalledWith(paymentId);
  });
});

afterEach(() => {
  jest.resetAllMocks();
});
