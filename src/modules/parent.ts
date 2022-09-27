import { Address, BigInt } from "@graphprotocol/graph-ts";

import { Parent } from "../../generated/schema";
import { assignForwarders } from "./forwarders";

export function createParent(id: string): Parent {
	let parent = new Parent(id);
	parent.flushConsumed = BigInt.fromU64(0);
	parent.flushConsumptionsCount = 0;
	parent.createConsumed = BigInt.fromU64(0);
	parent.createConsumptionsCount = 0;
	parent.active = false;
	return parent;
}

export function getAssignableForwardersCount(parent: Parent): u32 {
	let totalConsumptionsCount =
		parent.flushConsumptionsCount + parent.createConsumptionsCount;
	return totalConsumptionsCount / 5;
}

export function increaseParentStats(
	parent: Parent,
	data: {
		createConsumed?: BigInt;
		createConsumptionsCount?: u32;
		flushConsumed?: BigInt;
		flushConsumptionsCount?: u32;
	}
): void {
	if (data.createConsumed)
		parent.createConsumed = parent.createConsumed.plus(data.createConsumed);

	if (data.createConsumptionsCount)
		parent.createConsumptionsCount =
			parent.createConsumptionsCount + data.createConsumptionsCount;

	if (data.flushConsumed)
		parent.flushConsumed = parent.flushConsumed.plus(data.flushConsumed);

	if (data.flushConsumptionsCount)
		parent.flushConsumptionsCount =
			parent.flushConsumptionsCount + data.flushConsumptionsCount;

	parent.assignableForwardersCount = getAssignableForwardersCount(parent);
}

export function tryToAssignMoreForwarders(
	gasStation: Address,
	parent: Parent,
	lastConsumedForwarderIndex: u32
) {
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
