import { Address, store } from "@graphprotocol/graph-ts";
import { WhitelistedAddress } from "../../generated/schema";

function computeId(value: Address, ownershipId: string): string {
  return value.toHex() + "-" + ownershipId;
}

export function addWhitelistedAddress(
  value: Address,
  ownershipId: string
): WhitelistedAddress {
  let wa = new WhitelistedAddress(computeId(value, ownershipId));
  wa.value = value;
  wa.ownership = ownershipId;
  wa.save();
  return wa;
}

export function removeWhitelistedAddress(
  value: Address,
  ownershipId: string
): string {
  let id = computeId(value, ownershipId);
  store.remove("WhitelistedAddress", id);
  return id;
}
