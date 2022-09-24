import { Address, Bytes } from "@graphprotocol/graph-ts";

import { GasStation } from "../../generated/GasStation/GasStation";
import { Forwarder } from "../../generated/schema";

function numberToUint256(value: number): string {
	const hex = value.toString(16).split(".")[0];
	return `0x${"0".repeat(64 - hex.length)}${hex}`;
}

export function assignForwarders(
	start: number,
	count: number,
	gasStation: Address,
	parent: Address
): void {
	let gs = GasStation.bind(gasStation);
	for (let i = start; i < start + count; i++) {
		let forwarderAddress = gs.computeForwarderAddress(
			Bytes.fromHexString(numberToUint256(i)),
			parent
		);

		let forwarder = new Forwarder(forwarderAddress.toHexString());
		forwarder.parent = parent.toHexString();
		forwarder.index = i;
		forwarder.save();
	}
}
