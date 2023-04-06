import { createOwnership, toOwnershipId } from "./modules/ownership";
import { createHolder } from "./modules/holder";
import { upsertRule } from "./modules/rule";

import { ProxyDeployed, Transfer } from "../generated/Curra/Curra";

export function handleProxyDeployed(event: ProxyDeployed): void {
	let ownershipId = toOwnershipId(event.params.ownershipId);
	let address = event.params.proxyAddress;
	upsertRule(ownershipId, address);
}

export function handleTransfer(event: Transfer): void {
	let holder = createHolder(event.params.to);
	createOwnership(event.params.id, holder.id);
}
