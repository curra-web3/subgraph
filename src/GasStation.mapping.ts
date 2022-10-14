import { Address, log, BigInt } from "@graphprotocol/graph-ts";

import {
  Filled,
  ConfigSet,
  CreateConsumed,
  FlushConsumed,
} from "../generated/GasStation/GasStation";
import { ERC20 } from "../generated/GasStation/ERC20";
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

  // parent can become inactive after capacity drained
  parent.save();
}

export function handleCreateConsumed(event: CreateConsumed): void {
  let parent = getParentOrAbort(event.params.parent.toHexString());
  increaseParentStats(parent, event.params.value, 1, BigInt.fromU32(0), 0);

  let global = getGlobal();
  increaseGlobalStats(global, event.params.value, 1, BigInt.fromU32(0), 0);
  global.save();

  // parent can become inactive after capacity drained
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

export function handleConfigSet(event: ConfigSet): void {
  let parentId = event.params.parent.toHexString();
  let token = event.params.token;
  let configId = computeConfigId(parentId, token);

  let config = Config.load(configId);
  if (event.params.min.isZero() && !config) {
    log.info("No config {} and min value set to 0. Skipping", [configId]);
    return;
  }

  if (!config) {
    config = new Config(configId);
    config.parent = event.params.parent.toHexString();
    if (ERC20.bind(event.params.token).try_decimals().reverted) {
      log.info("Skipping config – not a ERC20 token {}", [token.toHex()]);
      return;
    }
    config.token = event.params.token;
  }

  config.maxGasPrice = event.params.maxGasPrice;
  config.min = event.params.min;

  // check if address is erc20 token
  config.save();
  log.info(
    "Config updated or created {}. Min – {}, token – {}, max gas price – {}",
    [
      configId,
      config.min.toString(),
      config.token.toHexString(),
      config.maxGasPrice.toString(),
    ]
  );
}
