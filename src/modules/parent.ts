import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Parent } from "../../generated/schema";
import { assignForwarders } from "./forwarders";

export function createParent(id: string): Parent {
  let parent = new Parent(id);
  parent.flushConsumed = BigInt.fromU64(0);
  parent.flushConsumptionsCount = 0;
  parent.createConsumed = BigInt.fromU64(0);
  parent.createConsumptionsCount = 0;
  parent.assignableForwardersCount = 0;
  return parent;
}

export function getAssignableForwardersCount(parent: Parent): u32 {
  let totalConsumptionsCount =
    parent.flushConsumptionsCount + parent.createConsumptionsCount;
  return totalConsumptionsCount / 10;
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

  parent.assignableForwardersCount = getAssignableForwardersCount(parent);
}

export function tryToAssignMoreForwarders(
  gasStation: Address,
  parent: Parent,
  lastConsumedForwarderIndex: i32
): void {
  let forwardersCount = parent.forwarders.length;
  let assignableForwardersCount = parent.assignableForwardersCount;
  let assignToIndex = lastConsumedForwarderIndex + 100;
  let assignRequired = assignToIndex > forwardersCount;

  if (assignRequired) {
    let to =
      assignableForwardersCount < assignToIndex
        ? assignableForwardersCount
        : assignToIndex;
    let from = forwardersCount;
    assignForwarders(from, to, gasStation, Address.fromString(parent.id));
  }
}
