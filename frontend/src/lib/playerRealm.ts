import { getRealmTheme } from './realmTheme';

// Zero is InterSiddhi, never an unknown/default Realm.
export function playerRealm(realmId?: number | null) {
    if (realmId == null || ![303, 202, 101, 55, 44, 0].includes(realmId)) {
        return { realmId: null, realmName: '', realmColor: getRealmTheme(undefined).accent };
    }
    const theme = getRealmTheme(realmId);
    return { realmId, realmName: theme.name, realmColor: theme.accent };
}
