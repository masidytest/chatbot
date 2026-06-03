import { generateDummyPassword } from "./db/utils";

export const isProductionEnvironment = process.env.NODE_ENV === "production";
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT
);

export const guestRegex = /^guest-\d+$/;

export const DUMMY_PASSWORD = generateDummyPassword();

export const suggestions = [
  "What is the weather in Cairo right now?",
  "Write a Python function to sort a list",
  "ما هي أحدث أخبار اليوم؟",
  "Generate an image of a sunset over the ocean",
  "What is the Bitcoin price today?",
  "¿Qué puedes hacer por mí?",
];
