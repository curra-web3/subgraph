import { BigInt } from "@graphprotocol/graph-ts";

import { OwnershipToken } from "../../generated/schema";
import { emptyHolderId } from "./holder";

export function tokenIdToId(value: BigInt): string {
  return value.toString();
}

export function createOwnership(
  tokenId: BigInt,
  holderId: string
): OwnershipToken {
  let ownership = new OwnershipToken(tokenIdToId(tokenId));
  ownership.flushConsumed = BigInt.fromU64(0);
  ownership.flushConsumptionsCount = 0;
  ownership.createConsumed = BigInt.fromU64(0);
  ownership.createConsumptionsCount = 0;
  ownership.holder = holderId;
  ownership.save();

  return ownership;
}

function getOwnershipOrAbort(id: string): OwnershipToken {
  let parent = OwnershipToken.load(id);
  if (!parent) throw new Error("No parent entity. Logic invariant");
  return parent;
}

export function createOwnershipIfNotExists(tokenId: BigInt): OwnershipToken {
  let ownership = OwnershipToken.load(tokenIdToId(tokenId));

  if (!ownership) {
    ownership = createOwnership(tokenId, emptyHolderId());
  }

  return ownership;
}

export function increaseOwnershipStats(
  id: string,
  createConsumed: BigInt,
  createConsumptionsCount: i32,
  flushConsumed: BigInt,
  flushConsumptionsCount: i32
): void {
  const ownership = getOwnershipOrAbort(id);
  ownership.createConsumed = ownership.createConsumed.plus(createConsumed);
  ownership.createConsumptionsCount =
    ownership.createConsumptionsCount + createConsumptionsCount;

  ownership.flushConsumed = ownership.flushConsumed.plus(flushConsumed);
  ownership.flushConsumptionsCount =
    ownership.flushConsumptionsCount + flushConsumptionsCount;
  ownership.save();
}
