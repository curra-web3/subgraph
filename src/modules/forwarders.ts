import { Address, Bytes, BigInt, log } from "@graphprotocol/graph-ts";

import { ERC20 } from "../../generated/GasStation/ERC20";
import { GasStation } from "../../generated/GasStation/GasStation";
import { Forwarder } from "../../generated/schema";

function numberToUint256(value: u32): string {
  const hex = value.toString(16).split(".")[0];
  return `0x${"0".repeat(64 - hex.length)}${hex}`;
}

export function getForwarderBalance(
  forwarder: Address,
  token: Address
): BigInt {
  let erc20 = ERC20.bind(token);
  return erc20.balanceOf(forwarder);
}

export function computeForwarderAddress(
  gasStation: GasStation,
  parent: Address,
  i: u32
): Address {
  return gasStation.computeForwarderAddress(
    Bytes.fromHexString(numberToUint256(i)),
    parent
  );
}

export function assignForwarders(
  from: u32,
  to: u32,
  gasStation: Address,
  parent: Address
): void {
  log.info("Assigning new forwarders for parent {}, range – [{}, {}]", [
    parent.toHexString(),
    from.toString(),
    to.toString(),
  ]);

  const gs = GasStation.bind(gasStation);
  for (let i = from; i < to; i++) {
    let forwarderAddress = computeForwarderAddress(gs, parent, i);
    let forwarder = new Forwarder(forwarderAddress.toHexString());
    forwarder.parent = parent.toHexString();
    forwarder.index = i;
    forwarder.save();
  }
}
