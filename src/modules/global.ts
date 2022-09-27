import { Global } from "../../generated/schema";

import { BigInt } from "@graphprotocol/graph-ts";

export function getGlobal(): Global {
	let global = Global.load("singleton");

	if (!global) {
		global = new Global("singleton");

		global.createConsumptionsCount = 0;
		global.createConsumed = BigInt.fromU32(0);

		global.flushConsumptionsCount = 0;
		global.flushConsumed = BigInt.fromU32(0);
	}

	return global;
}

export function increaseGlobalStats(
	global: Global,
	data: {
		createConsumed?: BigInt;
		createConsumptionsCount?: u32;
		flushConsumed?: BigInt;
		flushConsumptionsCount?: u32;
	}
): void {
	if (data.createConsumed)
		global.createConsumed = global.createConsumed.plus(data.createConsumed);

	if (data.createConsumptionsCount)
		global.createConsumptionsCount =
			global.createConsumptionsCount + data.createConsumptionsCount;

	if (data.flushConsumed)
		global.flushConsumed = global.flushConsumed.plus(data.flushConsumed);

	if (data.flushConsumptionsCount)
		global.flushConsumptionsCount =
			global.flushConsumptionsCount + data.flushConsumptionsCount;
}
