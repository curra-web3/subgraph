import { Filled, GasStation } from '../generated/GasStation/GasStation';
import { Parent, Forwarder } from '../generated/schema';
import { Bytes } from '@graphprotocol/graph-ts';

export function handleFilled(event: Filled): void {
  let parentAddress = event.params.parent;
  let parent = new Parent(parentAddress.toHex());
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
