import type { Language } from "@/lib/ports";
import type { Trip } from "@/lib/user-storage";

export type AccountState = {
  favorites:string[];
  trips:Trip[];
  preferences:{ language:Language; lastPort:string };
};

export type ClientSessionStatus = "checking"|"signed-out"|"visitor"|"authenticated";

function emptyState(language:Language):AccountState {
  return { favorites:[], trips:[], preferences:{ language, lastPort:"keelung" } };
}

export function createNewAccountState(language:Language):AccountState {
  return emptyState(language);
}

export function createVisitorState(language:Language):AccountState {
  return emptyState(language);
}

export function shouldPersistLocally(status:ClientSessionStatus):boolean {
  return status!=="visitor";
}

export function shouldSyncToCloud(status:ClientSessionStatus):boolean {
  return status==="authenticated";
}
