import { BigInt } from "@graphprotocol/graph-ts";

import { Ownership } from "../../generated/schema";

export function toOwnershipId(value: BigInt): string {
  return value.toString();
}

export function createOwnership(
  tokenId: BigInt,
  holderId: string
): Ownership {
  let ownership = new Ownership(toOwnershipId(tokenId));
  ownership.holder = holderId;
  ownership.save();

  return ownership;
}
