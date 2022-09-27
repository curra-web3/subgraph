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
  createConsumed: BigInt,
  createConsumptionsCount: u32,
  flushConsumed: BigInt,
  flushConsumptionsCount: u32
): void {
  global.createConsumed = global.createConsumed.plus(createConsumed);
  global.createConsumptionsCount =
    global.createConsumptionsCount + createConsumptionsCount;

  global.flushConsumed = global.flushConsumed.plus(flushConsumed);
  global.flushConsumptionsCount =
    global.flushConsumptionsCount + flushConsumptionsCount;
}
