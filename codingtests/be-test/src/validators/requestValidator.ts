import { JSONSchemaType } from "ajv";
import ajv from "./ajvInstance";
import { PaymentRequestType } from "../lib/payments";

const schema: JSONSchemaType<PaymentRequestType> = {
  type: "object",
  properties: {
    amount: { type: "number", exclusiveMinimum: 0 },
    currency: { type: "string", pattern: "^[A-Z]{3}$" },
  },
  required: ["amount", "currency"],
  additionalProperties: false,
};

export const validatePaymentRequest = ajv.compile(schema);
