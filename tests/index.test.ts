import { describe, test } from "matchstick-as/assembly/index";
import { handleFilled } from "../src/GasStation.mapping";
import { createFilledEvent } from "./utils";
import { logStore } from "matchstick-as/assembly/store";

const TEST_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";

describe("main", () => {
	test("common scenario", () => {
		let filledEvent = createFilledEvent(TEST_ADDRESS, 1000);
		handleFilled(filledEvent);
		logStore();
	});
});
