import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";

import { Config, Forwardable } from "../../generated/schema";
import { computeConfigId } from "./config";
import { getForwarderBalance } from "./forwarders";

export function createForwardable(
	forwarderId: string,
	configId: string,
	token: Address
): Forwardable {
	let id = forwarderId + "-" + token.toHexString();
	let forwardable = new Forwardable(id);
	forwardable.forwarder = forwarderId;
	forwardable.config = configId;
	forwardable.ready = false;
	return forwardable;
}

export function reindexForwardable({
	parentId,
	forwarderId,
	token,
}: {
	forwarderId: string;
	token: Address;
	parentId: string;
}): void {
	let configId = computeConfigId(parentId, token);
	let balance = getForwarderBalance(Address.fromString(forwarderId), token);
	if (balance.isZero()) {
		log.info("Removing forwardable – {}, token – {}. Reason: zero balance", [
			token.toHexString(),
			forwarderId,
		]);
		return makeNonForwardable(forwarderId, token);
	}
	let forwardable = createForwardable(forwarderId, configId, token);
	forwardable.balance = balance;

	let config = Config.load(configId);
	if (config) {
		forwardable.ready = isForwardableReady(balance, config.min);
	}

	log.info(
		"Updating forwardable – {}, token – {}, balance – {}, active – {}.",
		[
			token.toHexString(),
			forwarderId,
			forwardable.balance.toString(),
			forwardable.ready.toString(),
		]
	);
	forwardable.save();
}

export function isForwardableReady(balance: BigInt, min: BigInt): boolean {
	return balance >= min;
}

export function computeForwardableId(
	forwarderId: string,
	token: Address
): string {
	return forwarderId + "-" + token.toHexString();
}

export function makeNonForwardable(forwarderId: string, token: Address): void {
	let id = computeForwardableId(forwarderId, token);
	store.remove("Forwardable", id);
}
