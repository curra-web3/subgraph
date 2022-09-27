import { Address, log, BigInt } from "@graphprotocol/graph-ts";

import {
  Filled,
  ConfigSet,
  CreateConsumed,
  FlushConsumed,
} from "../generated/GasStation/GasStation";
import { ERC20 } from "../generated/GasStation/ERC20";
import { Parent, Config, Forwarder } from "../generated/schema";
import { IndexedERC20 } from "../generated/templates";
import { assignForwarders } from "./modules/forwarders";
import {
  createParent,
  increaseParentStats,
  tryToAssignMoreForwarders,
} from "./modules/parent";
import { getGlobal, increaseGlobalStats } from "./modules/global";
import {
  computeConfigId,
  reindexConfigForwardablesReadiness,
} from "./modules/config";

function getParentOrAbort(address: Address): Parent {
  let parent = Parent.load(address.toHexString());
  if (!parent) throw new Error("No parent entity. Logic invariant");
  return parent;
}

export function handleFlushedConsumed(event: FlushConsumed): void {
  let parent = getParentOrAbort(event.params.parent);
  increaseParentStats(parent, BigInt.fromU32(0), 0, event.params.value, 1);
  let forwarder = Forwarder.load(event.params.forwarder.toHexString());
  if (forwarder)
    tryToAssignMoreForwarders(event.address, parent, forwarder.index);
  // parent can become inactive after capacity drained
  parent.save();

  let global = getGlobal();
  increaseGlobalStats(global, BigInt.fromU32(0), 0, event.params.value, 1);
  global.save();
}

export function handleCreateConsumed(event: CreateConsumed): void {
  let parent = getParentOrAbort(event.params.parent);
  increaseParentStats(parent, event.params.value, 1, BigInt.fromU32(0), 0);
  let forwarder = Forwarder.load(event.params.forwarder.toHexString());
  if (forwarder) {
    tryToAssignMoreForwarders(event.address, parent, forwarder.index);
  }
  // parent can become inactive after capacity drained
  parent.save();

  let global = getGlobal();
  increaseGlobalStats(global, event.params.value, 1, BigInt.fromU32(0), 0);
  global.save();
}

export function handleFilled(event: Filled): void {
  let parentAddress = event.params.parent;
  let parentId = parentAddress.toHexString();
  let parent = Parent.load(parentId);

  if (!parent) {
    log.info("Creating new parent {}", [parentId]);
    parent = createParent(parentId);
    assignForwarders(0, 500, event.address, parentAddress);
  }

  parent.save();
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

  let minValueChanged = false;

  if (!config) {
    config = new Config(configId);
    config.parent = event.params.parent.toHexString();
    if (ERC20.bind(event.params.token).try_decimals().reverted) {
      log.info("Skipping config – not a ERC20 token {}", [token.toHex()]);
      return;
    }
    config.min = event.params.min;
    config.token = event.params.token;
    IndexedERC20.create(Address.fromBytes(config.token));
  } else {
    minValueChanged = config.min != event.params.min;
    // if min value in config changed it's possible that some forwarder will become non forwardable/forwardable
    if (minValueChanged) {
      log.info("Min value changed for config {}. Min value – {} -> {}", [
        configId,
        config.min.toString(),
        event.params.min.toString(),
      ]);
      reindexConfigForwardablesReadiness(config);
    }
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
