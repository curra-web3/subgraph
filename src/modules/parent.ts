import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { Parent } from "../../generated/schema";
import { assignForwarders } from "./forwarders";

export function createParent(id: string): Parent {
  let parent = new Parent(id);
  parent.flushConsumed = BigInt.fromU64(0);
  parent.flushConsumptionsCount = 0;
  parent.createConsumed = BigInt.fromU64(0);
  parent.createConsumptionsCount = 0;
  parent.assignableForwardersCount = 100;
  parent.assignedForwardersCount = 0;
  return parent;
}

export function getAssignableForwardersCount(parent: Parent): u32 {
  let totalConsumptionsCount =
    parent.flushConsumptionsCount + parent.createConsumptionsCount;
  let assignableForwardersCount = totalConsumptionsCount / 10;
  // max value
  return parent.assignableForwardersCount > assignableForwardersCount
    ? parent.assignableForwardersCount
    : assignableForwardersCount;
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
  let assigned = parent.assignedForwardersCount;
  let assignable = parent.assignableForwardersCount;
  let assignToIndex = lastConsumedForwarderIndex + 100;
  let assignRequired = assignToIndex > assigned;

  log.info(
    "Trying to assign new forwarders for parent – {}, assignable – {}, assigned – {}, assign to – {}, assign required – {}",
    [
      parent.id,
      assignable.toString(),
      assigned.toString(),
      assignToIndex.toString(),
      assignRequired.toString(),
    ]
  );

  if (assignRequired) {
    let to = assignable < assignToIndex ? assignable : assignToIndex;
    let from = assigned;
    if (to > from) {
      assignParentForwarders(from, to, gasStation, parent);
    }
  }
}

export function assignParentForwarders(
  from: u32,
  to: u32,
  gasStation: Address,
  parent: Parent
): void {
  assignForwarders(from, to, gasStation, Address.fromString(parent.id));
  parent.assignedForwardersCount += to - from;
}
