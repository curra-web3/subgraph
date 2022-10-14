import { Address } from "@graphprotocol/graph-ts";

export function computeConfigId(parentId: string, token: Address): string {
  return parentId + "-" + token.toHexString();
}
