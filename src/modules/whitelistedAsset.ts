import { Address, store } from "@graphprotocol/graph-ts";
import { WhitelistedAsset } from "../../generated/schema";

function computeId(ownershipId: string, address: Address): string {
  return ownershipId + "-" + address.toHexString();
}

export function upsertWhitelistedAsset(
  ownershipId: string,
  value: Address
): WhitelistedAsset {
  let id = computeId(ownershipId, value);
  let asset = new WhitelistedAsset(id);
  asset.ownership = ownershipId;
  asset.address = value;
  asset.save();
  return asset;
}

export function removeWhitelistedAsset(
  ownershipId: string,
  value: Address
): void {
  let id = computeId(ownershipId, value);
  store.remove("WhitelistedAsset", id);
}
