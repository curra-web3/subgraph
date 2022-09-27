import { Address } from "@graphprotocol/graph-ts";
import { Config, Forwardable } from "../../generated/schema";
import { isForwardableReady } from "./forwardables";

export function computeConfigId(parentId: string, token: Address): string {
	return parentId + "-" + token.toHexString();
}

export function reindexConfigForwardablesReadiness(config: Config): void {
	for (let i = 0; i < config.forwardables.length; i++) {
		let id = config.forwardables[i];
		let forwardable = Forwardable.load(id);
		if (!forwardable)
			throw new Error(
				"Logic invariant. Not possible that recently fetched forwardable is not available"
			);
		forwardable.ready = isForwardableReady(forwardable.balance, config.min);
		forwardable.save();
	}
}
