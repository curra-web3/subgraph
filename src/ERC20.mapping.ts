import { log } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/GasStation/ERC20";
import { Forwarder } from "../generated/schema";
import { makeNonForwardable, reindexForwardable } from "./modules/forwardables";

export function handleTransfer(event: Transfer): void {
	// deposit
	let forwarder = Forwarder.load(event.params.to.toHexString());
	if (forwarder) {
		log.info(
			"Catched transfer ({}) to forwarder ({}) in tx ({}) with value of {}",
			[
				event.address.toHexString(),
				forwarder.id,
				event.receipt?.transactionHash.toHexString() ?? "?",
				event.params.value.toString(),
			]
		);

		reindexForwardable({
			parentId: forwarder.parent,
			token: event.address,
			forwarderId: forwarder.id,
		});
		return;
	}

	// flush
	forwarder = Forwarder.load(event.params.from.toHexString());
	if (forwarder) {
		log.info(
			"Catched transfer ({}) from forwarder ({}) in tx ({}) with value of {} to {}",
			[
				event.address.toString(),
				forwarder.id,
				event.receipt?.transactionHash.toString() ?? "?",
				event.params.value.toString(),
				event.params.to.toHexString(),
			]
		);
		makeNonForwardable(forwarder.id, event.address);
	}
}
