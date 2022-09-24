import { Address, BigInt, log } from "@graphprotocol/graph-ts";

import {
	Filled,
	ConfigSet,
	Consumed,
} from "../generated/GasStation/GasStation";
import { ERC20 } from "../generated/GasStation/ERC20";
import { Parent, Config } from "../generated/schema";
import { IndexedERC20 } from "../generated/templates";
import {
	isForwardable,
	makeForwardable,
	makeNonForwardable,
} from "./modules/forwardables";
import { assignForwarders } from "./modules/forwarders";

export function handleConsumed(event: Consumed): void {
	let parentAddress = event.params.parent;
	let parentId = parentAddress.toHexString();

	let parent = Parent.load(parentId);
	if (!parent) log.error("No parent on consumed event somehow?!", []);

	// if no entity created yet – create and assign first 10 addresses
	assignForwarders(0, 10, event.address, parentAddress);
}

export function handleFilled(event: Filled): void {
	let parentAddress = event.params.parent;
	let parentId = parentAddress.toHexString();
	let parent = Parent.load(parentId);

	if (parent) return;
	parent = new Parent(parentId);
	// if no entity created yet – create and assign first 10 addresses
	assignForwarders(0, 10, event.address, parentAddress);
	parent.save();
}

function indexForwardable(
	config: Config,
	forwarderId: string,
	transferValue?: BigInt
): void {
	if (isForwardable(config, forwarderId, transferValue)) {
		makeForwardable(forwarderId, config.id, config.token);
	} else {
		makeNonForwardable(forwarderId, config.token);
	}
}

export function handleConfigSet(event: ConfigSet): void {
	let configId =
		event.params.parent.toHexString() + event.params.token.toHexString();
	let minValueChanged = false;
	let config = Config.load(configId);

	if (!config) {
		config = new Config(configId);
		config.parent = event.params.parent.toHexString();
		if (ERC20.bind(event.params.token).try_decimals().reverted) {
			log.info("Skipping config – not a ERC20 token {}", [
				event.params.token.toHex(),
			]);
			return;
		}
		config.token = event.params.token;
		IndexedERC20.create(Address.fromBytes(config.token));
	} else {
		minValueChanged = config.min != event.params.min;
		// if min value in config changed it's possible that some forwarder will become non forwardable/forwardable
		if (minValueChanged) {
			for (let i = 0; i < config.forwardables.length; i++) {
				let forwarderId = config.forwardables[i];
				indexForwardable(config, forwarderId);
			}
		}
	}

	config.maxGasPrice = event.params.maxGasPrice;
	config.min = event.params.min;

	// check if address is erc20 token
	config.save();
}
