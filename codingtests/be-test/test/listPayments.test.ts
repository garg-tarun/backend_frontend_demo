import { randomUUID } from "crypto";
import { handler } from "../src/listPayments";
import { APIGatewayProxyEvent } from "aws-lambda";

jest.mock("../src/lib/payments");
import * as payments from "../src/lib/payments";

const mockedListPayments = payments.listPayments as jest.Mock;

describe("When the user creates the payment request", () => {
  const mockedPaymentsUSD = [
    {
      id: randomUUID(),
      amount: 300,
      currency: "USD",
    },
    {
      id: randomUUID(),
      amount: 500,
      currency: "USD",
    },
  ];
  const mockedResponseSGD = [
    {
      id: randomUUID(),
      amount: 200,
      currency: "SGD",
    },
  ];
  const mockedResponse = [...mockedPaymentsUSD, ...mockedResponseSGD];

  beforeEach(() => {
    mockedListPayments.mockImplementation(async (currency?: string) => {
      return currency
        ? mockedResponse.filter((p) => p.currency === currency)
        : mockedResponse;
    });
  });

  it("Returns 200 with payments list without currency parameter ", async () => {
    const result = await handler({} as unknown as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual(mockedResponse);
    expect(mockedListPayments).toHaveBeenCalledWith(undefined);
  });

  it("Returns 200 with payments list with currency parameter ", async () => {
    const mockEvent = {
      queryStringParameters: {
        currency: "USD",
      },
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual(mockedPaymentsUSD);
    expect(mockedListPayments).toHaveBeenCalledWith("USD");
  });

  it(" ", async () => {});
});

afterEach(() => {
  jest.resetAllMocks();
});
