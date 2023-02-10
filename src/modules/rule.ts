import { Address } from "@graphprotocol/graph-ts";
import { Rule } from "../../generated/schema";

export function toRuleId(address: Address): string {
	return address.toHexString();
}

export function upsertRule(ownershipId: string, address: Address): Rule {
	let rule = new Rule(toRuleId(address));
	rule.ownership = ownershipId;
	rule.save();
	return rule;
}
