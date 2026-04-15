'use client';

import { REALM_GUIDANCE_CONTENT } from '@/lib/realmGuidanceContent';
import { REALM_STATE_MAP, type RealmId } from '@/lib/realmStateMap';

interface RealmGuidanceCardProps {
  realmId: RealmId;
}

export default function RealmGuidanceCard({ realmId }: RealmGuidanceCardProps) {
  const realm = REALM_STATE_MAP[realmId];
  const guidance = REALM_GUIDANCE_CONTENT[realmId];

  return (
    <div
      className="glass-card p-6 mb-8"
      style={{
        border: `1px solid ${realm.color}33`,
        boxShadow: `0 8px 30px ${realm.color}12`,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
          style={{
            background: `linear-gradient(135deg, ${realm.color}22, ${realm.color}55)`,
            border: `1px solid ${realm.color}55`,
          }}
        >
          {realm.icon}
        </div>

        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.18em] text-white/60 mb-2">
            Realm Meaning
          </p>

          <h2
            className="text-2xl md:text-3xl font-display mb-3"
            style={{ color: realm.color }}
          >
            Why enter {realm.realmName}?
          </h2>

          <p className="text-secondary mb-4">{guidance.whenToEnter}</p>
          <p className="text-secondary mb-5">{guidance.whyThisRealmHelps}</p>

          <div className="flex flex-wrap gap-2">
            {guidance.helpsWith.map((item) => (
              <span
                key={item}
                className="px-3 py-1 rounded-full text-sm"
                style={{
                  background: `${realm.color}18`,
                  border: `1px solid ${realm.color}44`,
                  color: realm.color,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}