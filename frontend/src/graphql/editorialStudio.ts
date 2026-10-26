import { gql } from '@apollo/client';
// Deliberately metadata-only. Never fetch media URLs or run scheduled-publication queries.
export const STUDIO_CONFIG = gql`query StudioConfig { editorialStudioConfig {
 id selectedWorldIds featuredTrackId realmAnchors { realmId trackId }
 realmOrders { realmId trackIds } realmDiscovery { realmId worldId }
 realmSoundtracks { realmId worldId trackId } nexusRealmSamplers { realmId trackIds }
 samplerRevision updatedAt placementHistory { action destination sourceId selected realmId at }
} }`;
export const STUDIO_SIGNALS = gql`query StudioSignals { nexusReviewQueue {
 track { id title realmId visibility status catalogTreatment playbackStatus accessTier canAccessAudio accessGate nexusReviewStatus showInNexus nexusSubmittedAt nexusReviewedAt nexusReviewNotes nexusPublishedAt nexusUnpublishedAt }
 releaseWorld { id title slug visibility status publicCanon }
 creativeProfile { artistName displayName }
} }`;
export const STUDIO_PROJECTS = gql`query StudioProjects { publicProjects(includeNonCanon: true) {
 creatorName realmId isSelected
 world { id title slug visibility status publicCanon coverArtUrl }
 tracks { id title realmId visibility status catalogTreatment playbackStatus accessTier nexusReviewStatus showInNexus }
} }`;
export const STUDIO_ASSESSMENT = gql`query StudioAssessment($trackIds:[ID!]!,$worldIds:[ID!]!,$proposedRealmId:Int) { editorialStudioAssessment(trackIds:$trackIds,worldIds:$worldIds,proposedRealmId:$proposedRealmId) { id kind publicSoundtrack publicNexus anonymousPlayable actions { name allowed reasons } } }`;
export const STUDIO_DELIVERY = gql`query StudioDelivery($realmId:Int) { publicEditorialDelivery(realmId:$realmId) { checkedAt soundtrackIds samplerIds nexusIds discoveryIds worldIds spotlightId } }`;
export const STUDIO_EVIDENCE = gql`query StudioEvidence($trackId:ID!){ nexusReviewEvidence(trackId:$trackId){ id title body meta kind } }`;
export const STUDIO_SOUNDTRACK = gql`mutation StudioSoundtrack($trackId:ID!,$realmId:Int!,$selected:Boolean!){setRealmSoundtrack(trackId:$trackId,realmId:$realmId,selected:$selected){id}}`;
export const STUDIO_DISCOVERY = gql`mutation StudioDiscovery($worldId:ID!,$realmId:Int!,$selected:Boolean!){setRealmDiscovery(worldId:$worldId,realmId:$realmId,selected:$selected){id}}`;
export const STUDIO_WORLD = gql`mutation StudioWorld($worldId:ID!,$selected:Boolean!){setNexusProjectSelection(worldId:$worldId,selected:$selected){id}}`;
export const STUDIO_SAMPLER = gql`mutation StudioSampler($realmId:Int!,$trackIds:[ID!]!,$expectedRevision:Int!){setNexusRealmSampler(realmId:$realmId,trackIds:$trackIds,expectedRevision:$expectedRevision){id samplerRevision}}`;
