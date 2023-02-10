import { Address } from "@graphprotocol/graph-ts";
import { Holder } from "../../generated/schema";

export function toHolderId(address: Address): string {
	return address.toHex();
}

export function createHolder(address: Address): Holder {
	let holder = new Holder(toHolderId(address));
	holder.save();
	return holder;
}
