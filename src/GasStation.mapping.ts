import { Address, Bytes, log } from "@graphprotocol/graph-ts";

import {
  Filled,
  GasStation,
  ConfigSet,
} from "../generated/GasStation/GasStation";
import { ERC20 } from "../generated/GasStation/ERC20";
import { Parent, Forwarder, Config } from "../generated/schema";
import { IndexedERC20 } from "../generated/templates";

function numberToUint256(value: number): string {
  const hex = value.toString(16).split(".")[0];
  log.info("HEX: {}", [hex]);
  return `0x${"0".repeat(64 - hex.length)}${hex}`;
}

export function handleFilled(event: Filled): void {
  let parentAddress = event.params.parent;
  let parent = new Parent(parentAddress.toHexString());
  let gasStation = GasStation.bind(event.address);
  for (let i = 0; i < 10; i++) {
    let forwarderAddress = gasStation.computeForwarderAddress(
      Bytes.fromHexString(numberToUint256(i)),
      parentAddress
    );

    let forwarder = new Forwarder(forwarderAddress.toHexString());
    forwarder.parent = parent.id;
    forwarder.flushReady = [];
    forwarder.index = i;
    forwarder.save();
  }
  parent.save();
}

export function handleConfigSet(event: ConfigSet): void {
  let config = new Config(
    event.params.parent.toHexString().concat(event.params.token.toHexString())
  );
  config.maxGasPrice = event.params.maxGasPrice;
  config.min = event.params.min;
  config.parent = event.params.parent.toHexString();
  // check if address is erc20 token
  if (ERC20.bind(event.params.token).try_decimals().reverted) {
    log.info("Skipping config – not a ERC20 token {}", [
      event.params.token.toHex(),
    ]);
    return;
  }
  config.token = event.params.token;
  config.save();
  IndexedERC20.create(Address.fromBytes(config.token));
}
