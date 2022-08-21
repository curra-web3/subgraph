import {
  Filled,
  GasStation,
  ConfigSet,
} from "../generated/GasStation/GasStation";
import { ERC20 } from "../generated/GasStation/ERC20";
import { Parent, Forwarder, Config } from "../generated/schema";
import { Bytes, log } from "@graphprotocol/graph-ts";

export function handleFilled(event: Filled): void {
  let parentAddress = event.params.parent;
  let parent = new Parent(parentAddress);
  let gasStation = GasStation.bind(event.address);
  for (let i = 0; i < 10; i++) {
    let forwarder = new Forwarder(
      gasStation.computeForwarderAddress(Bytes.fromI32(i), parentAddress)
    );
    forwarder.parent = parent.id;
    forwarder.save();
  }
  parent.save();
}

export function handleConfigSet(event: ConfigSet): void {
  let config = new Config(event.params.parent.concat(event.params.token));
  config.maxGasPrice = event.params.maxGasPrice;
  config.min = event.params.min;
  config.parent = event.params.parent;
  // check if address is erc20 token
  if (ERC20.bind(event.params.token).try_decimals().reverted) {
    log.info("Skipping config – not a ERC20 token {}", [
      event.params.token.toHex(),
    ]);
    return;
  }
  config.token = event.params.token;
  config.save();
}
