import * as payments from "../src/lib/payments";
import { randomUUID } from "crypto";
import { handler } from "../src/createPayment";
import { APIGatewayProxyEvent } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";

jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

describe("When the user creates the payment request", () => {
  it("Returns error with 422 status code with invalid amount parameter", async () => {
    const mockEvent = {
      body: JSON.stringify({
        amount: 0,
        currency: "SGD",
      }),
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(mockEvent);

    const expectedError = {
      statusCode: 422,
      error_message: {
        message: "must be > 0",
      },
    };

    expect(result.statusCode).toBe(expectedError.statusCode);
    expect(JSON.parse(result.body)).toEqual(expectedError.error_message);
  });

  it("Returns error with 422 status code with invalid currency parameter", async () => {
    const mockEvent = {
      body: JSON.stringify({
        amount: 240,
        currency: "EEUR",
      }),
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(mockEvent);

    const expectedError = {
      statusCode: 422,
      error_message: {
        message: 'must match pattern "^[A-Z]{3}$"',
      },
    };

    expect(result.statusCode).toBe(expectedError.statusCode);
    expect(JSON.parse(result.body)).toEqual(expectedError.error_message);
  });

  it("Returns error with 422 status code with invalid currency parameter type", async () => {
    const mockEvent = {
      body: JSON.stringify({
        amount: 240,
        currency: 123,
      }),
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(mockEvent);
    const expectedError = {
      statusCode: 422,
      error_message: {
        message: "must be string",
      },
    };

    expect(result.statusCode).toBe(expectedError.statusCode);
    expect(JSON.parse(result.body)).toEqual(expectedError.error_message);
  });

  it("Returns error with 422 status code with invalid amount parameter type", async () => {
    const mockEvent = {
      body: JSON.stringify({
        amount: "240",
        currency: "USD",
      }),
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(mockEvent);
    const expectedError = {
      statusCode: 422,
      error_message: {
        message: "must be number",
      },
    };

    expect(result.statusCode).toBe(expectedError.statusCode);
    expect(JSON.parse(result.body)).toEqual(expectedError.error_message);
  });

  it("Returns error with 422 status code, when amount is missing ", async () => {
    const mockEvent = {
      body: JSON.stringify({
        currency: "USD",
      }),
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(mockEvent);
    const expectedError = {
      statusCode: 422,
      error_message: {
        message: "must have required property 'amount'",
      },
    };

    expect(result.statusCode).toBe(expectedError.statusCode);
    expect(JSON.parse(result.body)).toEqual(expectedError.error_message);
  });

  it("Returns error with 422 status code, when currency is missing ", async () => {
    const mockEvent = {
      body: JSON.stringify({
        amount: 240,
      }),
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(mockEvent);
    const expectedError = {
      statusCode: 422,
      error_message: {
        message: "must have required property 'currency'",
      },
    };

    expect(result.statusCode).toBe(expectedError.statusCode);
    expect(JSON.parse(result.body)).toEqual(expectedError.error_message);
  });

  it("Returns error with 422 status code, when additional input parameter is given ", async () => {
    const mockEvent = {
      body: JSON.stringify({
        amount: 240,
        currency: "USD",
        id: "1234",
      }),
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(mockEvent);
    const expectedError = {
      statusCode: 422,
      error_message: {
        message: "must NOT have additional properties",
      },
    };

    expect(result.statusCode).toBe(expectedError.statusCode);
    expect(JSON.parse(result.body)).toEqual(expectedError.error_message);
  });

  it("Returns status code as 201 on successful payment creation request", async () => {
    const requestBody = {
      amount: 240,
      currency: "USD",
    };

    const mockEvent = {
      body: JSON.stringify(requestBody),
    } as unknown as APIGatewayProxyEvent;

    const mockUuid = "test-payment-id";
    (uuidv4 as jest.Mock).mockImplementation(() => mockUuid);

    const createPaymentMock = jest
      .spyOn(payments, "createPayment")
      .mockResolvedValueOnce(undefined);

    const result = await handler(mockEvent);
    const expectedArgs = {
      id: "test-payment-id",
      ...requestBody,
    };
    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body)).toEqual({ result: mockUuid });
    expect(createPaymentMock).toHaveBeenCalledWith(expectedArgs);
  });
});

afterEach(() => {
  jest.resetAllMocks();
});
