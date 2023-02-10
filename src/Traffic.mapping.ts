import { createOwnership, toOwnershipId } from "./modules/ownership";
import { createHolder } from "./modules/holder";
import { RuleSet, Transfer } from "../generated/Traffic/Traffic";
import { upsertRule } from "./modules/rule";

export function handleRuleSet(event: RuleSet): void {
	let ownershipId = toOwnershipId(event.params.ownershipId);
	let address = event.params.value;
	upsertRule(ownershipId, address);
}

export function handleTransfer(event: Transfer): void {
	let holder = createHolder(event.params.to);
	createOwnership(event.params.tokenId, holder.id);
}
