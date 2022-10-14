import { BigInt } from "@graphprotocol/graph-ts";
import { Parent } from "../../generated/schema";

export function createParent(id: string): Parent {
  let parent = new Parent(id);
  parent.flushConsumed = BigInt.fromU64(0);
  parent.flushConsumptionsCount = 0;
  parent.createConsumed = BigInt.fromU64(0);
  parent.createConsumptionsCount = 0;
  return parent;
}

export function increaseParentStats(
  parent: Parent,
  createConsumed: BigInt,
  createConsumptionsCount: i32,
  flushConsumed: BigInt,
  flushConsumptionsCount: i32
): void {
  parent.createConsumed = parent.createConsumed.plus(createConsumed);
  parent.createConsumptionsCount =
    parent.createConsumptionsCount + createConsumptionsCount;

  parent.flushConsumed = parent.flushConsumed.plus(flushConsumed);
  parent.flushConsumptionsCount =
    parent.flushConsumptionsCount + flushConsumptionsCount;
}
