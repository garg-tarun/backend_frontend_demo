import { DocumentClient } from "./dynamodb";
import {
  GetCommand,
  PutCommand,
  ScanCommand,
  ScanCommandInput,
} from "@aws-sdk/lib-dynamodb";

export const getPayment = async (
  paymentId: string
): Promise<Payment | null> => {
  const result = await DocumentClient.send(
    new GetCommand({
      TableName: "Payments",
      Key: { paymentId },
    })
  );

  return (result.Item as Payment) || null;
};

export const listPayments = async (currency?: string): Promise<Payment[]> => {
  const params: ScanCommandInput = {
    TableName: "Payments",
  };
  if (currency) {
    params.FilterExpression = "#currency = :currencyVal";
    params.ExpressionAttributeNames = {
      "#currency": "currency",
    };
    params.ExpressionAttributeValues = {
      ":currencyVal": currency,
    };
  }
  const result = await DocumentClient.send(new ScanCommand(params));

  return (result.Items as Payment[]) || [];
};

export const createPayment = async (payment: Payment) => {
  await DocumentClient.send(
    new PutCommand({
      TableName: "Payments",
      Item: payment,
    })
  );
};

export type Payment = {
  id: string;
  amount: number;
  currency: string;
};

export type PaymentRequestType = Omit<Payment, "id">;
