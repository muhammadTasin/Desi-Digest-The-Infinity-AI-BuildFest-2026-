
import { classifyMessageIntent } from "../src/lib/intent-classifier";

const testCases = [
  {
    message: "amar onek mangsho khete iccha korche kom tk er moddhe kon mangsho khaw jay jeta healthy hobe and heart er jonno valo diabetes hobe na low sodium",
    expected: "health_safe_food_recommendation",
  },
  {
    message: "kom tk er moddhe healthy mangsho konta",
    expected: "health_safe_food_recommendation",
  },
  {
    message: "heart er jonno kon meat valo",
    expected: "health_safe_food_recommendation",
  },
  {
    message: "diabetes thakle chicken khawa jabe?",
    expected: "health_safe_food_recommendation",
  },
  {
    message: "low sodium mangsho option",
    expected: "health_safe_food_recommendation",
  },
  {
    message: "amar mangsho khete iccha korche healthy ki khabo",
    expected: "health_safe_food_recommendation",
  },
  {
    message: "khashi na murgi konta better",
    expected: "health_safe_food_recommendation",
  },
  {
    message: "need food",
    expected: "general_chat", // Real question/request, should trigger Gemini
  },
  {
    message: "nanu",
    expected: "general_chat", // Greeting/clarification
  },
  {
    message: "assalamu alaikum",
    expected: "general_chat", // Greeting
  },
  {
    message: "hi",
    expected: "general_chat", // Greeting
  },
  {
    message: "what are the calories in rice?",
    expected: "nutrition",
  },
  {
    message: "tell me about diabetes",
    expected: "condition",
  }
];

let failed = 0;
console.log("Running Intent Classifier Tests...\n");

for (const { message, expected } of testCases) {
  const actual = classifyMessageIntent(message);
  if (actual === expected) {
    console.log(`✅ PASS: "${message.slice(0, 40)}..." -> ${actual}`);
  } else {
    console.log(`❌ FAIL: "${message.slice(0, 40)}..."`);
    console.log(`   Expected: ${expected}`);
    console.log(`   Actual:   ${actual}`);
    failed++;
  }
}

if (failed === 0) {
  console.log("\nAll tests passed! 🎉");
  process.exit(0);
} else {
  console.log(`\n${failed} tests failed.`);
  process.exit(1);
}
