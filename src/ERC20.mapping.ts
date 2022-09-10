import { Address, log } from "@graphprotocol/graph-ts";

import { ERC20, Transfer } from "../generated/GasStation/ERC20";
import { Forwarder, Config } from "../generated/schema";

function makeFlushReady(forwarder: Forwarder, address: Address): void {
  let index = -1;
  for (let i = 0; i < forwarder.flushReady.length; i++) {
    if (forwarder.flushReady[i] == address.toHexString()) {
      index = i;
    }
  }
  if (index >= 0) return;
  forwarder.flushReady = forwarder.flushReady.concat([address.toHexString()]);
  forwarder.save();
}

function handleTransferToForwarder(
  forwarder: Forwarder,
  event: Transfer
): void {
  let configId = forwarder.parent.concat(event.address.toHexString());
  let config = Config.load(configId);

  // if no config then client is not interested in this token
  if (!config) return;

  // if transfer value bigger then config min value is time to mark forwarder as ready
  if (config.min <= event.params.value) {
    makeFlushReady(forwarder, event.address);
    return;
  }

  let erc20 = ERC20.bind(event.address);
  let balance = erc20.balanceOf(Address.fromString(forwarder.id));

  if (balance < config.min) return;

  makeFlushReady(forwarder, event.address);
}

// removed flushed tokens
function handleTransferFromForwarder(
  forwarder: Forwarder,
  event: Transfer
): void {
  let index = -1;
  for (let i = 0; i < forwarder.flushReady.length; i++) {
    if (forwarder.flushReady[i] === event.address.toHexString()) index = i;
  }

  if (index < 0) {
    log.error(
      "Flushed token ({}) was not indexed before for some reason for forwarder {}",
      [event.address.toHexString(), forwarder.id]
    );
  }
  forwarder.flushReady = forwarder.flushReady
    .slice(0, index)
    .concat(forwarder.flushReady.slice(index + 1, forwarder.flushReady.length));
}

export function handleTransfer(event: Transfer): void {
  // deposit
  let forwarder = Forwarder.load(event.params.to.toHexString());
  if (forwarder) {
    handleTransferToForwarder(forwarder, event);
    return;
  }

  // flush
  forwarder = Forwarder.load(event.params.from.toHexString());
  if (forwarder) handleTransferFromForwarder(forwarder, event);
}
