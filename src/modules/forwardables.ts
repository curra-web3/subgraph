import { Address, BigInt, store } from "@graphprotocol/graph-ts";

import { ERC20 } from "../../generated/GasStation/ERC20";
import { Config, Forwardable } from "../../generated/schema";

export function makeForwardable(
	forwarderId: string,
	configId: string,
	token: Address
): void {
	let id = forwarderId + "-" + token.toHexString();
	let forwardable = new Forwardable(id);
	forwardable.forwarder = forwarderId;
	forwardable.config = configId;
	forwardable.save();
}

export function isForwardable(
	config: Config,
	forwarderId: string,
	transferValue?: BigInt
): bool {
	// if transfer value bigger then config min value is time to mark forwarder as ready
	if (transferValue && config.min <= transferValue) return true;
	let erc20 = ERC20.bind(config.token);
	let balance = erc20.balanceOf(Address.fromString(forwarderId));
	if (balance < config.min) return false;
	return true;
}

export function makeNonForwardable(forwarderId: string, token: Address): void {
	let id = forwarderId + "-" + token.toHexString();
	store.remove("Forwardable", id);
}
