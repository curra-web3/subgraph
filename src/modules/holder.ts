import { Address } from "@graphprotocol/graph-ts";
import { Holder } from "../../generated/schema";

export function emptyHolderId(): string {
  return Address.fromI32(0).toHex();
}

export function createHolder(address: Address): Holder {
  let holder = new Holder(address.toHex());
  holder.save();
  return holder;
}
