import { Address, BigInt } from "@graphprotocol/graph-ts";
import { assert, describe, test } from "matchstick-as/assembly/index";

import { toHolderId } from "../src/modules/holder";
import { toOwnershipId } from "../src/modules/ownership";
import { toRuleId } from "../src/modules/rule";
import { handleRuleSet, handleTransfer } from "../src/Traffic.mapping";
import { createRuleSet, createTransfer } from "./events";

describe("handleTransfer()", () => {
	test("Should create holder with ownership", () => {
		let from = Address.fromString("0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5");
		let to = Address.fromString("0x4675C7e5BaAFBFFbca748158bEcBA61ef3b0a263");
		let ownershipId = BigInt.fromI32(1);

		let event = createTransfer(from, to, ownershipId);
		handleTransfer(event);

		let ownershipEntityId = toOwnershipId(ownershipId);
		let holderEntityId = toHolderId(to);

		assert.fieldEquals("Holder", holderEntityId, "id", holderEntityId);
		assert.fieldEquals("Ownership", ownershipEntityId, "id", ownershipEntityId);
		assert.fieldEquals(
			"Ownership",
			ownershipEntityId,
			"holder",
			holderEntityId
		);
	});

	test("Should upsert rule", () => {
		let value = Address.fromString(
			"0x4675C7e5BaAFBFFbca748158bEcBA61ef3b0a263"
		);
		let ownershipId = BigInt.fromI32(1);

		let event = createRuleSet(ownershipId, value);
		handleRuleSet(event);

		let ownershipEntityId = toOwnershipId(ownershipId);
		let ruleEntityId = toRuleId(value);

		assert.fieldEquals("Rule", ruleEntityId, "id", ruleEntityId);
		assert.fieldEquals("Rule", ruleEntityId, "ownership", ownershipEntityId);
	});
});
