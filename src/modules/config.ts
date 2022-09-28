import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { GasStation } from "../../generated/GasStation/GasStation";
import { Forwardable } from "../../generated/schema";
import { computeForwardableId, isForwardableReady } from "./forwardables";
import { computeForwarderAddress } from "./forwarders";

export function computeConfigId(parentId: string, token: Address): string {
  return parentId + "-" + token.toHexString();
}

export function reindexConfigForwardablesReadiness(
  token: Address,
  min: BigInt,
  gasStation: Address,
  parent: Address,
  count: u32
): void {
  let gs = GasStation.bind(gasStation);

  for (let i = <u32>0; i < count; i++) {
    let address = computeForwarderAddress(gs, parent, i);
    let forwarderId = address.toHexString();
    let forwardable = Forwardable.load(
      computeForwardableId(forwarderId, token)
    );
    if (!forwardable) continue;
    let ready = isForwardableReady(forwardable.balance, min);
    log.info(
      "Reindexing forwardable {} for parent {}, ready – {}, min - {}, balance - {}",
      [
        forwarderId,
        parent.toHexString(),
        ready.toString(),
        min.toString(),
        forwardable.balance.toString(),
      ]
    );
    forwardable.ready = ready;
    forwardable.save();
  }
}
