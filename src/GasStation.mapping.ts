import { log, BigInt, store } from "@graphprotocol/graph-ts";

import {
  Filled,
  WhitelistedAssetAdded,
  CreateConsumed,
  FlushConsumed,
  WhitelistedAssetRemoved,
} from "../generated/GasStation/GasStation";
import { Parent, Config } from "../generated/schema";
import { createParent, increaseParentStats } from "./modules/parent";
import { getGlobal, increaseGlobalStats } from "./modules/global";
import { computeConfigId } from "./modules/config";

function getParentOrAbort(id: string): Parent {
  let parent = Parent.load(id);
  if (!parent) throw new Error("No parent entity. Logic invariant");
  return parent;
}

export function handleFlushConsumed(event: FlushConsumed): void {
  let parent = getParentOrAbort(event.params.parent.toHexString());
  increaseParentStats(parent, BigInt.fromU32(0), 0, event.params.value, 1);

  let global = getGlobal();
  increaseGlobalStats(global, BigInt.fromU32(0), 0, event.params.value, 1);
  global.save();

  parent.save();
}

export function handleCreateConsumed(event: CreateConsumed): void {
  let parent = getParentOrAbort(event.params.parent.toHexString());
  increaseParentStats(parent, event.params.value, 1, BigInt.fromU32(0), 0);

  let global = getGlobal();
  increaseGlobalStats(global, event.params.value, 1, BigInt.fromU32(0), 0);
  global.save();

  parent.save();
}

export function handleFilled(event: Filled): void {
  let parentAddress = event.params.parent;
  let parentId = parentAddress.toHexString();
  let parent = Parent.load(parentId);

  if (!parent) {
    log.info("Creating new parent {}", [parentId]);
    parent = createParent(parentId);
    parent.save();
  }
}

export function handleWhitelistedAssetAdded(
  event: WhitelistedAssetAdded
): void {
  let parentId = event.params.parent.toHexString();
  let token = event.params.token;
  let configId = computeConfigId(parentId, token);

  let config = Config.load(configId);

  if (!config) {
    config = new Config(configId);
    config.parent = event.params.parent.toHexString();
    config.token = event.params.token;
  }

  config.save();
  log.info("Config updated or created {}. Token – {}", [
    configId,
    config.token.toHexString(),
  ]);
}

export function handleWhitelistedAssetRemoved(
  event: WhitelistedAssetRemoved
): void {
  let parentId = event.params.parent.toHexString();
  let token = event.params.token;
  let configId = computeConfigId(parentId, token);
  store.remove("Config", configId);
  log.info("Config removed {}", [configId]);
}
