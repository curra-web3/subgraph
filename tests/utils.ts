import { Filled } from "../generated/GasStation/GasStation";
import { newMockEvent } from "matchstick-as/assembly/index";
import { Address, ethereum } from "@graphprotocol/graph-ts";

export function createFilledEvent(
	parentAddress: string,
	value: i32
): Filled {
	let newGravatarEvent = changetype<Filled>(newMockEvent());
	newGravatarEvent.parameters = new Array();
	let parentParam = new ethereum.EventParam(
		"parent",
		ethereum.Value.fromAddress(Address.fromString(parentAddress))
	);
	let valueParam = new ethereum.EventParam(
		"value",
		ethereum.Value.fromI32(value)
	);

	newGravatarEvent.parameters.push(valueParam);
	newGravatarEvent.parameters.push(parentParam);

	return newGravatarEvent;
}
