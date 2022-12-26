import { BigInt } from "@graphprotocol/graph-ts";

import {
  Filled,
  WhitelistedAssetAdded,
  CreateConsumed,
  FlushConsumed,
  WhitelistedAssetRemoved,
  WhitelistedAddressAdded,
  WhitelistedAddressRemoved,
  Transfer,
} from "../generated/GasStation/GasStation";
import {
  createOwnership,
  createOwnershipIfNotExists,
  increaseOwnershipStats,
  tokenIdToId,
} from "./modules/ownership";
import { increaseGlobalStats } from "./modules/global";
import {
  removeWhitelistedAsset,
  upsertWhitelistedAsset,
} from "./modules/whitelistedAsset";
import {
  addWhitelistedAddress,
  removeWhitelistedAddress,
} from "./modules/whitelisedAddress";
import { createHolder } from "./modules/holder";

export function handleFlushConsumed(event: FlushConsumed): void {
  increaseOwnershipStats(
    tokenIdToId(event.params.ownershipId),
    BigInt.fromU32(0),
    0,
    event.params.value,
    1
  );

  increaseGlobalStats(BigInt.fromU32(0), 0, event.params.value, 1);
}

export function handleCreateConsumed(event: CreateConsumed): void {
  increaseOwnershipStats(
    tokenIdToId(event.params.ownershipId),
    event.params.value,
    1,
    BigInt.fromU32(0),
    0
  );

  increaseGlobalStats(event.params.value, 1, BigInt.fromU32(0), 0);
}

export function handleFilled(event: Filled): void {
  createOwnershipIfNotExists(event.params.ownershipId);
}

export function handleWhitelistedAssetAdded(
  event: WhitelistedAssetAdded
): void {
  let ownershipId = tokenIdToId(event.params.ownershipId);
  let address = event.params.token;
  upsertWhitelistedAsset(ownershipId, address);
}

export function handleWhitelistedAssetRemoved(
  event: WhitelistedAssetRemoved
): void {
  let ownershipId = tokenIdToId(event.params.ownershipId);
  let address = event.params.token;
  removeWhitelistedAsset(ownershipId, address);
}

export function handleWhitelistedAddressAdded(
  event: WhitelistedAddressAdded
): void {
  addWhitelistedAddress(
    event.params.value,
    tokenIdToId(event.params.ownershipId)
  );
}

export function handleWhitelistedAddressRemoved(
  event: WhitelistedAddressRemoved
): void {
  removeWhitelistedAddress(
    event.params.value,
    tokenIdToId(event.params.ownershipId)
  );
}

export function handleTransfer(event: Transfer): void {
  let holder = createHolder(event.params.to);
  createOwnership(event.params.tokenId, holder.id);
}
