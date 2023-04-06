import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { ProxyDeployed, Transfer } from "../generated/Curra/Curra";

export function createProxyDeployed(ownershipId: BigInt, address: Address): ProxyDeployed {
	let event = changetype<ProxyDeployed>(newMockEvent());
	event.parameters = new Array();
	let idParam = new ethereum.EventParam(
		"ownershipId",
		ethereum.Value.fromSignedBigInt(ownershipId)
	);
	let addressParam = new ethereum.EventParam(
		"value",
		ethereum.Value.fromAddress(address)
	);

	event.parameters.push(idParam);
	event.parameters.push(addressParam);

	return event;
}

export function createTransfer(
	from: Address,
	to: Address,
	ownershipId: BigInt
): Transfer {
	let event = changetype<Transfer>(newMockEvent());
	event.parameters = new Array();
	let idParam = new ethereum.EventParam(
		"id",
		ethereum.Value.fromSignedBigInt(ownershipId)
	);
	let fromParam = new ethereum.EventParam(
		"from",
		ethereum.Value.fromAddress(from)
	);
	let toParam = new ethereum.EventParam(
		"to",
		ethereum.Value.fromAddress(to)
	);

	event.parameters.push(fromParam);
	event.parameters.push(toParam);
	event.parameters.push(idParam);

	return event;
}
