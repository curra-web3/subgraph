import { Address, BigInt } from "@graphprotocol/graph-ts";

import { Transfer } from "../generated/GasStation/ERC20";
import { Forwarder, Config } from "../generated/schema";
import {
	isForwardable,
	makeForwardable,
	makeNonForwardable,
} from "./modules/forwardables";

function tryToMakeForwardable(
	forwarder: Forwarder,
	token: Address,
	value: BigInt
): void {
	let configId = forwarder.parent + "-" + token.toHexString();
	let config = Config.load(configId);
	// if no config then client is not interested in this token
	if (!config) return;
	if (isForwardable(config, forwarder.id, value)) {
		makeForwardable(forwarder.id, configId, config.token);
	}
}

// removed flushed tokens

export function handleTransfer(event: Transfer): void {
	// deposit
	let forwarder = Forwarder.load(event.params.to.toHexString());
	if (forwarder) {
		tryToMakeForwardable(forwarder, event.address, event.params.value);
		return;
	}

	// flush
	forwarder = Forwarder.load(event.params.from.toHexString());
	if (forwarder) makeNonForwardable(forwarder.id, event.address);
}
