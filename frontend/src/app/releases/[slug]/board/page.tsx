'use client';

import type { CSSProperties, PointerEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { gql, useMutation, useQuery } from '@apollo/client';
import '@/styles/signalBoard.css';

const STORAGE_KEY_PREFIX = 'cosmic:release-signal-board';

const GET_RELEASE_WORLD_BY_SLUG = gql`
  query GetReleaseWorldBySlug($slug: String!) {
    getMyReleaseWorldBySlug(slug: $slug) {
      id
      title
      slug
      releaseType
      status
      visibility
      isFeatured
      oneLineSummary
      story
      currentFocus
      secondFocus
      fullDropDate
      updatedAt
      lastOpenedAt
    }
  }
`;

const GET_BOARD_ARTIFACTS = gql`
  query GetBoardArtifacts($releaseWorldId: ID!) {
    getBoardArtifacts(releaseWorldId: $releaseWorldId) {
      id
      kind
      eyebrow
      title
      body
      meta
      href
      connectedTrackSlug
      position {
        x
        y
        rotate
      }
      style {
        color
        size
        layer
      }
      isGenerated
      isUserCreated
    }
  }
`;

const SAVE_BOARD_ARTIFACTS = gql`
  mutation SaveBoardArtifacts($releaseWorldId: ID!, $artifacts: [BoardArtifactInput!]!) {
    saveBoardArtifacts(releaseWorldId: $releaseWorldId, artifacts: $artifacts) {
      id
      kind
      eyebrow
      title
      body
      meta
      href
      connectedTrackSlug
      position {
        x
        y
        rotate
      }
      style {
        color
        size
        layer
      }
      isGenerated
      isUserCreated
    }
  }
`;

const UPDATE_RELEASE_WORLD = gql`
  mutation UpdateReleaseWorld($id: ID!, $input: UpdateReleaseWorldInput!) {
    updateReleaseWorld(id: $id, input: $input) {
      id
      title
      slug
      releaseType
      status
      visibility
      isFeatured
      oneLineSummary
      story
      currentFocus
      secondFocus
      fullDropDate
      updatedAt
      lastOpenedAt
    }
  }
`;

type ArtifactKind =
  | 'center'
  | 'realm'
  | 'track'
  | 'moon'
  | 'visual'
  | 'hook'
  | 'action'
  | 'portal'
  | 'cover'
  | 'note'
  | 'image'
  | 'lyric'
  | 'asset';

type ArtifactColor = 'cream' | 'sky' | 'violet' | 'gold' | 'rose' | 'mint' | 'graphite';
type ArtifactSize = 'sm' | 'md' | 'lg' | 'xl';

interface ReleaseWorld {
  id: string;
  title: string;
  slug: string;
  releaseType: string;
  status: string;
  visibility: string;
  isFeatured: boolean;
  oneLineSummary?: string | null;
  story?: string | null;
  currentFocus?: string | null;
  secondFocus?: string | null;
  fullDropDate?: string | null;
  updatedAt?: string | null;
  lastOpenedAt?: string | null;
}

interface PortalSettings {
  title: string;
  releaseType: string;
  status: string;
  visibility: string;
  oneLineSummary: string;
  story: string;
  currentFocus: string;
  secondFocus: string;
  fullDropDate: string;
}

interface BoardArtifact {
  id: string;
  kind: ArtifactKind;
  eyebrow: string;
  title: string;
  body: string;
  meta?: string;
  href?: string;
  connectedTrackSlug?: string;
  x: number;
  y: number;
  rotate?: number;
  color?: ArtifactColor;
  size?: ArtifactSize;
  layer?: number;
  isGenerated?: boolean;
  isUserCreated?: boolean;
}

interface StoredBoardState {
  boardColor: ArtifactColor;
  artifacts: BoardArtifact[];
}

interface MongoBoardArtifact {
  id: string;
  kind: ArtifactKind;
  eyebrow?: string | null;
  title: string;
  body?: string | null;
  meta?: string | null;
  href?: string | null;
  connectedTrackSlug?: string | null;
  position: {
    x: number;
    y: number;
    rotate: number;
  };
  style: {
    color: ArtifactColor;
    size: ArtifactSize;
    layer: number;
  };
  isGenerated: boolean;
  isUserCreated: boolean;
}

const colorOptions: Array<{ value: ArtifactColor; label: string }> = [
  { value: 'cream', label: 'Cream' },
  { value: 'sky', label: 'Sky' },
  { value: 'violet', label: 'Violet' },
  { value: 'gold', label: 'Gold' },
  { value: 'rose', label: 'Rose' },
  { value: 'mint', label: 'Mint' },
  { value: 'graphite', label: 'Graphite' },
];

const sizeOptions: Array<{ value: ArtifactSize; label: string }> = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Feature' },
];

const layerOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
}

function getStorageKey(slug: string) {
  return `${STORAGE_KEY_PREFIX}:${slug}`;
}

function getProjectSummary(releaseWorld?: ReleaseWorld | null) {
  return (
    releaseWorld?.oneLineSummary?.trim() ||
    releaseWorld?.story?.trim() ||
    'The center of this project world. Add hooks, visuals, notes, portals, rollout ideas, and campaign signals around it.'
  );
}

function getProjectFocusOptions(releaseWorld?: ReleaseWorld | null) {
  const options: Array<{ slug: string; title: string }> = [];

  if (releaseWorld?.currentFocus?.trim()) {
    options.push({
      slug: 'current-focus',
      title: releaseWorld.currentFocus.trim(),
    });
  }

  if (releaseWorld?.secondFocus?.trim()) {
    options.push({
      slug: 'second-focus',
      title: releaseWorld.secondFocus.trim(),
    });
  }

  if (options.length === 0) {
    options.push({
      slug: 'project-hook',
      title: 'Project Hook',
    });
  }

  return options;
}

function getTrackTitle(slug: string, releaseWorld?: ReleaseWorld | null) {
  return getProjectFocusOptions(releaseWorld).find((track) => track.slug === slug)?.title ?? 'Project Hook';
}

function getInitialArtifacts(
  boardColor: ArtifactColor = 'cream',
  releaseWorld?: ReleaseWorld | null,
  releaseTitle = 'Untitled Release World'
): BoardArtifact[] {
  const title = releaseWorld?.title ?? releaseTitle;
  const summary = getProjectSummary(releaseWorld);
  const focusOptions = getProjectFocusOptions(releaseWorld);

  const starterArtifacts: BoardArtifact[] = [
    {
      id: 'release-world-center',
      kind: 'center',
      eyebrow: 'Release World',
      title,
      body: summary,
      meta: 'Main world',
      x: 50,
      y: 42,
      rotate: 0,
      color: boardColor,
      size: 'xl',
      layer: 9,
      isGenerated: true,
      isUserCreated: false,
    },
    {
      id: 'project-story-lane',
      kind: 'note',
      eyebrow: 'Story Lane',
      title: 'World direction',
      body: 'Define the emotional promise, visual language, recurring symbols, and listener journey for this project.',
      meta: 'Story',
      x: 28,
      y: 58,
      rotate: -2,
      color: boardColor,
      size: 'lg',
      layer: 5,
      isGenerated: true,
      isUserCreated: false,
    },
    {
      id: 'visual-language-lane',
      kind: 'visual',
      eyebrow: 'Visual Language',
      title: 'Cover / clips / palette',
      body: 'Collect cover ideas, video fragments, photo references, color palettes, typography, and campaign imagery.',
      meta: 'Visuals',
      x: 72,
      y: 58,
      rotate: 2,
      color: boardColor,
      size: 'lg',
      layer: 5,
      isGenerated: true,
      isUserCreated: false,
    },
    {
      id: 'rollout-lane',
      kind: 'action',
      eyebrow: 'Rollout',
      title: 'Release path',
      body: 'Map the first teaser, lead signal, second push, final release, and follow-up content.',
      meta: 'Campaign',
      x: 38,
      y: 72,
      rotate: 1,
      color: boardColor,
      size: 'md',
      layer: 4,
      isGenerated: true,
      isUserCreated: false,
    },
  ];

  focusOptions.forEach((focus, index) => {
    starterArtifacts.push({
      id: `${focus.slug}-card`,
      kind: 'track',
      eyebrow: index === 0 ? 'Current Focus' : 'Second Focus',
      title: focus.title,
      body:
        index === 0
          ? 'Use this as the main entry point for the project. Add hooks, content ideas, cover direction, and release notes around it.'
          : 'Use this as the contrast signal or second doorway into the world.',
      meta: index === 0 ? 'Lead signal' : 'Second signal',
      x: index === 0 ? 30 : 70,
      y: 32,
      rotate: index === 0 ? -1 : 1,
      color: boardColor,
      size: 'md',
      layer: 6,
      isGenerated: true,
      isUserCreated: false,
    });
  });

  return starterArtifacts;
}

function mapMongoArtifact(artifact: MongoBoardArtifact): BoardArtifact {
  return {
    id: artifact.id,
    kind: artifact.kind,
    eyebrow: artifact.eyebrow ?? '',
    title: artifact.title,
    body: artifact.body ?? '',
    meta: artifact.meta ?? '',
    href: artifact.href ?? '',
    connectedTrackSlug: artifact.connectedTrackSlug ?? '',
    x: artifact.position.x,
    y: artifact.position.y,
    rotate: artifact.position.rotate,
    color: artifact.style.color ?? 'cream',
    size: artifact.style.size ?? 'md',
    layer: artifact.style.layer ?? 4,
    isGenerated: artifact.isGenerated,
    isUserCreated: artifact.isUserCreated,
  };
}

function mapArtifactToInput(artifact: BoardArtifact) {
  return {
    id: artifact.id,
    kind: artifact.kind,
    eyebrow: artifact.eyebrow,
    title: artifact.title,
    body: artifact.body,
    meta: artifact.meta ?? '',
    href: artifact.href ?? '',
    connectedTrackSlug: artifact.connectedTrackSlug ?? '',
    x: artifact.x,
    y: artifact.y,
    rotate: artifact.rotate ?? 0,
    color: artifact.color ?? 'cream',
    size: artifact.size ?? 'md',
    layer: artifact.layer ?? 4,
    isGenerated: artifact.isGenerated ?? false,
    isUserCreated: artifact.isUserCreated ?? true,
  };
}

function formatDateForInput(value?: string | null) {
  if (!value) return '';

  const numericValue = Number(value);
  const date = Number.isFinite(numericValue)
    ? new Date(numericValue)
    : new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().slice(0, 10);
}

function getPortalSettingsFromReleaseWorld(releaseWorld?: ReleaseWorld | null): PortalSettings {
  return {
    title: releaseWorld?.title ?? '',
    releaseType: releaseWorld?.releaseType ?? 'ep',
    status: releaseWorld?.status ?? 'draft',
    visibility: releaseWorld?.visibility ?? 'private',
    oneLineSummary: releaseWorld?.oneLineSummary ?? '',
    story: releaseWorld?.story ?? '',
    currentFocus: releaseWorld?.currentFocus ?? '',
    secondFocus: releaseWorld?.secondFocus ?? '',
    fullDropDate: formatDateForInput(releaseWorld?.fullDropDate),
  };
}

function getPortalSettingsInput(settings: PortalSettings) {
  return {
    title: settings.title.trim(),
    releaseType: settings.releaseType,
    status: settings.status,
    visibility: settings.visibility,
    oneLineSummary: settings.oneLineSummary.trim(),
    story: settings.story.trim(),
    currentFocus: settings.currentFocus.trim(),
    secondFocus: settings.secondFocus.trim(),
    fullDropDate: settings.fullDropDate || null,
  };
}

function looksLikeLegacySirensStarter(artifacts: BoardArtifact[], releaseTitle: string) {
  if (releaseTitle.toLowerCase().includes('sirens')) return false;
  if (artifacts.some((artifact) => artifact.isUserCreated)) return false;

  const joinedText = artifacts
    .map((artifact) => `${artifact.title} ${artifact.body} ${artifact.eyebrow} ${artifact.meta}`)
    .join(' ')
    .toLowerCase();

  return (
    joinedText.includes('sirens') ||
    joinedText.includes('neverland') ||
    joinedText.includes('doover') ||
    joinedText.includes('running from the plug') ||
    joinedText.includes('the veil') ||
    joinedText.includes('lit roads')
  );
}

function getStoredBoardState(slug: string, releaseWorld?: ReleaseWorld | null): StoredBoardState {
  const releaseTitle = releaseWorld?.title ?? 'Untitled Release World';

  if (typeof window === 'undefined') {
    return {
      boardColor: 'cream',
      artifacts: getInitialArtifacts('cream', releaseWorld, releaseTitle),
    };
  }

  const stored = window.localStorage.getItem(getStorageKey(slug));

  if (!stored) {
    return {
      boardColor: 'cream',
      artifacts: getInitialArtifacts('cream', releaseWorld, releaseTitle),
    };
  }

  try {
    const parsed = JSON.parse(stored) as Partial<StoredBoardState>;

    if (parsed.boardColor && Array.isArray(parsed.artifacts)) {
      if (looksLikeLegacySirensStarter(parsed.artifacts, releaseTitle)) {
        return {
          boardColor: parsed.boardColor,
          artifacts: getInitialArtifacts(parsed.boardColor, releaseWorld, releaseTitle),
        };
      }

      return {
        boardColor: parsed.boardColor,
        artifacts: parsed.artifacts,
      };
    }
  } catch {
    window.localStorage.removeItem(getStorageKey(slug));
  }

  return {
    boardColor: 'cream',
    artifacts: getInitialArtifacts('cream', releaseWorld, releaseTitle),
  };
}

function BoardArtifactCard({
  artifact,
  isSelected,
  onPointerDown,
  onDelete,
  onLayerNudge,
}: {
  artifact: BoardArtifact;
  isSelected: boolean;
  onPointerDown: (event: PointerEvent<HTMLElement>, id: string) => void;
  onDelete: (id: string) => void;
  onLayerNudge: (id: string, direction: -1 | 1) => void;
}) {
  const style = {
    '--pin-x': `${artifact.x}%`,
    '--pin-y': `${artifact.y}%`,
    '--pin-rotate': `${artifact.rotate ?? 0}deg`,
    '--pin-layer': artifact.layer ?? 4,
  } as CSSProperties;

  const className = [
    'signal-board-pin',
    `signal-board-pin-${artifact.kind}`,
    `signal-board-pin-color-${artifact.color ?? 'cream'}`,
    `signal-board-pin-size-${artifact.size ?? 'md'}`,
    artifact.isUserCreated ? 'signal-board-pin-user' : '',
    isSelected ? 'is-selected' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      className={className}
      style={style}
      onPointerDown={(event) => onPointerDown(event, artifact.id)}
    >
      <div className="signal-board-pin-cap" />

      {artifact.isUserCreated && (
        <button
          type="button"
          className="signal-board-delete"
          aria-label={`Delete ${artifact.title}`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onDelete(artifact.id);
          }}
        >
          ×
        </button>
      )}

      {artifact.kind === 'cover' && (
        <div className="signal-board-cover-stack">
          <span>EP</span>
          <span>01</span>
          <span>02</span>
        </div>
      )}

      {artifact.kind === 'hook' && <div className="signal-board-hook-mark">“</div>}

      <div className="signal-board-pin-content">
        <div className="signal-board-pin-topline">
          <p className="signal-board-pin-eyebrow">{artifact.eyebrow}</p>
          <span className="signal-board-layer-badge">L{artifact.layer ?? 4}</span>
        </div>
        <h2>{artifact.title}</h2>
        <p className="signal-board-pin-body">{artifact.body}</p>
      </div>

      <div className="signal-board-pin-footer">
        {artifact.meta && <span className="signal-board-pin-pill">{artifact.meta}</span>}

        <div className="signal-board-pin-tools">
          <button
            type="button"
            aria-label={`Move ${artifact.title} down one layer`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onLayerNudge(artifact.id, -1);
            }}
          >
            −
          </button>
          <button
            type="button"
            aria-label={`Move ${artifact.title} up one layer`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onLayerNudge(artifact.id, 1);
            }}
          >
            +
          </button>
        </div>

        {artifact.href && (
          <Link
            href={artifact.href}
            className="signal-board-pin-link"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            Open
          </Link>
        )}
      </div>
    </article>
  );
}

export default function DynamicReleaseSignalBoardPage() {
  const params = useParams<{ slug?: string | string[] }>();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] ?? '' : rawSlug ?? '';

  const boardRef = useRef<HTMLElement | null>(null);
  const controlsRef = useRef<HTMLElement | null>(null);

  const [hasHydrated, setHasHydrated] = useState(false);
  const [hasLoadedCloudBoard, setHasLoadedCloudBoard] = useState(false);
  const [saveMessage, setSaveMessage] = useState('Cloud board not saved this session.');

  const [boardColor, setBoardColor] = useState<ArtifactColor>('cream');
  const [artifacts, setArtifacts] = useState<BoardArtifact[]>(() =>
    getInitialArtifacts('cream', null, 'Release World')
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);

  const [selectedTrackSlug, setSelectedTrackSlug] = useState('project-hook');
  const [selectedColor, setSelectedColor] = useState<ArtifactColor>('cream');
  const [selectedSize, setSelectedSize] = useState<ArtifactSize>('md');
  const [selectedLayer, setSelectedLayer] = useState(5);

  const [hookTitle, setHookTitle] = useState('');
  const [hookDescription, setHookDescription] = useState('');
  const [noteTag, setNoteTag] = useState('Creator Note');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');

  const [portalSettings, setPortalSettings] = useState<PortalSettings>(() =>
    getPortalSettingsFromReleaseWorld(null)
  );
  const [portalMessage, setPortalMessage] = useState('Portal settings are synced from the release world.');

  const {
    data: releaseData,
    loading: releaseLoading,
    error: releaseError,
    refetch: refetchReleaseWorld,
  } = useQuery(GET_RELEASE_WORLD_BY_SLUG, {
    variables: { slug },
    skip: !slug,
    fetchPolicy: 'cache-and-network',
  });

  const releaseWorld = releaseData?.getMyReleaseWorldBySlug as ReleaseWorld | null | undefined;
  const releaseWorldId = releaseWorld?.id;
  const releaseTitle = releaseWorld?.title ?? 'Release World';
  const focusOptions = useMemo(() => getProjectFocusOptions(releaseWorld), [releaseWorld]);

  const {
    data: boardData,
    loading: boardLoading,
    error: boardError,
    refetch: refetchBoardArtifacts,
  } = useQuery(GET_BOARD_ARTIFACTS, {
    variables: {
      releaseWorldId,
    },
    skip: !releaseWorldId,
    fetchPolicy: 'cache-and-network',
  });

  const [saveBoardArtifacts, { loading: isSaving }] = useMutation(SAVE_BOARD_ARTIFACTS);
  const [updateReleaseWorld, { loading: isUpdatingPortal }] = useMutation(UPDATE_RELEASE_WORLD);

  useEffect(() => {
    if (!focusOptions.some((track) => track.slug === selectedTrackSlug)) {
      setSelectedTrackSlug(focusOptions[0]?.slug ?? 'project-hook');
    }
  }, [focusOptions, selectedTrackSlug]);

  useEffect(() => {
    if (!releaseWorld) return;

    setPortalSettings(getPortalSettingsFromReleaseWorld(releaseWorld));
    setPortalMessage('Portal settings loaded from MongoDB.');
  }, [releaseWorld]);

  useEffect(() => {
    if (!slug || !releaseWorld) return;

    const storedState = getStoredBoardState(slug, releaseWorld);
    setBoardColor(storedState.boardColor);
    setArtifacts(storedState.artifacts);
    setSelectedColor(storedState.boardColor);
    setHasHydrated(true);
  }, [slug, releaseWorld]);

  useEffect(() => {
    const cloudArtifacts = boardData?.getBoardArtifacts as MongoBoardArtifact[] | undefined;

    if (!cloudArtifacts || hasLoadedCloudBoard || !releaseWorld) return;

    if (cloudArtifacts.length === 0) {
      const starterArtifacts = getInitialArtifacts(boardColor, releaseWorld, releaseTitle);

      setArtifacts(starterArtifacts);
      setSelectedArtifactId(starterArtifacts[0]?.id ?? null);
      setHasLoadedCloudBoard(true);
      setSaveMessage('No cloud artifacts yet. Generic starter board created locally. Save to Cloud when ready.');
      return;
    }

    const mappedArtifacts = cloudArtifacts.map(mapMongoArtifact);

    if (looksLikeLegacySirensStarter(mappedArtifacts, releaseTitle)) {
      const starterArtifacts = getInitialArtifacts(boardColor, releaseWorld, releaseTitle);

      setArtifacts(starterArtifacts);
      setSelectedArtifactId(starterArtifacts[0]?.id ?? null);
      setHasLoadedCloudBoard(true);
      setSaveMessage(
        'Legacy SIRENS starter detected for this project. Generic starter board created locally. Save to Cloud to replace it.'
      );
      return;
    }

    const firstColor = mappedArtifacts[0]?.color ?? 'cream';

    setArtifacts(mappedArtifacts);
    setBoardColor(firstColor);
    setSelectedColor(firstColor);
    setSelectedArtifactId(mappedArtifacts[0]?.id ?? null);
    setHasLoadedCloudBoard(true);
    setSaveMessage(`Loaded ${mappedArtifacts.length} artifacts from MongoDB.`);
  }, [boardData, hasLoadedCloudBoard, boardColor, releaseWorld, releaseTitle]);

  useEffect(() => {
    if (!hasHydrated || !slug) return;

    window.localStorage.setItem(
      getStorageKey(slug),
      JSON.stringify({
        boardColor,
        artifacts,
      })
    );
  }, [hasHydrated, slug, boardColor, artifacts]);

  useEffect(() => {
    if (!activeId) return;

    function handlePointerMove(event: globalThis.PointerEvent) {
      const board = boardRef.current;
      if (!board) return;

      const rect = board.getBoundingClientRect();
      const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 4, 96);
      const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 6, 94);

      setArtifacts((current) =>
        current.map((artifact) => (artifact.id === activeId ? { ...artifact, x, y } : artifact))
      );
      setSaveMessage('Unsaved changes. Save to Cloud when ready.');
    }

    function handlePointerUp() {
      setActiveId(null);
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [activeId]);

  const selectedArtifact = useMemo(
    () => artifacts.find((artifact) => artifact.id === selectedArtifactId) ?? null,
    [artifacts, selectedArtifactId]
  );

  const hookArtifacts = useMemo(
    () => artifacts.filter((artifact) => artifact.kind === 'hook'),
    [artifacts]
  );

  const hookCounts = useMemo(
    () =>
      focusOptions.map((track) => ({
        slug: track.slug,
        title: track.title,
        count: hookArtifacts.filter((artifact) => artifact.connectedTrackSlug === track.slug).length,
      })),
    [focusOptions, hookArtifacts]
  );

  function updatePortalSetting<K extends keyof PortalSettings>(key: K, value: PortalSettings[K]) {
    setPortalSettings((current) => ({
      ...current,
      [key]: value,
    }));
    setPortalMessage('Unsaved portal changes. Save Portal Settings to update the release page.');
  }

  function updateArtifact(id: string, updates: Partial<BoardArtifact>) {
    setArtifacts((current) =>
      current.map((artifact) => (artifact.id === id ? { ...artifact, ...updates } : artifact))
    );
    setSaveMessage('Unsaved changes. Save to Cloud when ready.');
  }

  function handleArtifactPointerDown(event: PointerEvent<HTMLElement>, id: string) {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setSelectedArtifactId(id);
    setActiveId(id);
  }

  function nudgeLayer(id: string, direction: -1 | 1) {
    setArtifacts((current) =>
      current.map((artifact) =>
        artifact.id === id
          ? {
              ...artifact,
              layer: clamp((artifact.layer ?? 4) + direction, 1, 9),
            }
          : artifact
      )
    );
    setSaveMessage('Unsaved changes. Save to Cloud when ready.');
  }

  function addHook() {
    const cleanTitle = hookTitle.trim();
    const cleanDescription = hookDescription.trim();
    if (!cleanTitle && !cleanDescription) return;

    const trackTitle = getTrackTitle(selectedTrackSlug, releaseWorld);
    const matchingTrackIndex = focusOptions.findIndex((track) => track.slug === selectedTrackSlug);
    const id = makeId('hook');

    setArtifacts((current) => [
      ...current,
      {
        id,
        kind: 'hook',
        eyebrow: `${trackTitle} Hook`,
        title: cleanTitle || cleanDescription.slice(0, 34),
        body: cleanDescription || cleanTitle,
        meta: 'Hook artifact',
        connectedTrackSlug: selectedTrackSlug,
        x: clamp(24 + Math.max(matchingTrackIndex, 0) * 18, 12, 88),
        y: clamp(82 - Math.max(matchingTrackIndex, 0) * 5, 16, 92),
        rotate: matchingTrackIndex % 2 === 0 ? -2 : 2,
        color: selectedColor,
        size: selectedSize,
        layer: selectedLayer,
        isGenerated: false,
        isUserCreated: true,
      },
    ]);

    setSelectedArtifactId(id);
    setHookTitle('');
    setHookDescription('');
    setSaveMessage('Unsaved changes. Save to Cloud when ready.');
  }

  function addNoteArtifact() {
    const cleanBody = noteBody.trim();
    if (!cleanBody) return;

    const id = makeId('note');

    setArtifacts((current) => [
      ...current,
      {
        id,
        kind: 'note',
        eyebrow: noteTag.trim() || 'Creator Note',
        title: noteTitle.trim() || 'New artifact',
        body: cleanBody,
        meta: 'Artifact',
        x: 64,
        y: 72,
        rotate: -1,
        color: selectedColor,
        size: selectedSize,
        layer: selectedLayer,
        isGenerated: false,
        isUserCreated: true,
      },
    ]);

    setSelectedArtifactId(id);
    setNoteTitle('');
    setNoteBody('');
    setSaveMessage('Unsaved changes. Save to Cloud when ready.');
  }

  function applyStarterBoardColor(nextColor: ArtifactColor) {
    setBoardColor(nextColor);
    setSelectedColor(nextColor);
    setArtifacts((current) =>
      current.map((artifact) =>
        artifact.isUserCreated
          ? artifact
          : {
              ...artifact,
              color: nextColor,
            }
      )
    );
    setSaveMessage('Unsaved changes. Save to Cloud when ready.');
  }

  function deleteArtifact(id: string) {
    setArtifacts((current) => current.filter((artifact) => artifact.id !== id));
    if (selectedArtifactId === id) setSelectedArtifactId(null);
    setSaveMessage('Unsaved changes. Save to Cloud when ready.');
  }

  function resetBoard() {
    const resetArtifacts = getInitialArtifacts(boardColor, releaseWorld, releaseTitle);
    setArtifacts(resetArtifacts);
    setSelectedArtifactId(null);
    setSaveMessage('Local board reset. Save to Cloud only if you want to replace the cloud board.');
  }

  async function handleSavePortalSettings() {
    if (!releaseWorldId) {
      setPortalMessage('Save failed: release world could not be found.');
      return;
    }

    if (!portalSettings.title.trim()) {
      setPortalMessage('Save failed: title is required.');
      return;
    }

    try {
      setPortalMessage('Saving portal settings to MongoDB...');

      const result = await updateReleaseWorld({
        variables: {
          id: releaseWorldId,
          input: getPortalSettingsInput(portalSettings),
        },
      });

      const updatedWorld = result.data?.updateReleaseWorld as ReleaseWorld | undefined;

      if (updatedWorld) {
        setPortalSettings(getPortalSettingsFromReleaseWorld(updatedWorld));
        setPortalMessage('Portal settings saved. Open the Release Page to see the polished portal update.');
        await refetchReleaseWorld();
      } else {
        setPortalMessage('Portal settings saved, but no release world was returned.');
      }
    } catch (portalError) {
      const message = portalError instanceof Error ? portalError.message : 'Unknown portal save error.';
      setPortalMessage(`Portal save failed: ${message}`);
    }
  }

  async function handleSaveToCloud() {
    if (!releaseWorldId) {
      setSaveMessage('Save failed: release world could not be found.');
      return;
    }

    try {
      setSaveMessage('Saving board to MongoDB...');

      const result = await saveBoardArtifacts({
        variables: {
          releaseWorldId,
          artifacts: artifacts.map(mapArtifactToInput),
        },
      });

      const savedArtifacts = result.data?.saveBoardArtifacts as MongoBoardArtifact[] | undefined;

      if (savedArtifacts) {
        const mappedArtifacts = savedArtifacts.map(mapMongoArtifact);
        setArtifacts(mappedArtifacts);
        setSelectedArtifactId(mappedArtifacts[0]?.id ?? null);
        setHasLoadedCloudBoard(true);
        setSaveMessage(`Saved ${mappedArtifacts.length} artifacts to MongoDB.`);
      } else {
        setSaveMessage('Board saved, but no artifacts were returned.');
      }
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Unknown save error.';
      setSaveMessage(`Save failed: ${message}`);
    }
  }

  async function handleReloadCloudBoard() {
    setHasLoadedCloudBoard(false);
    setSaveMessage('Reloading cloud board...');
    await refetchReleaseWorld();

    if (releaseWorldId) {
      await refetchBoardArtifacts();
    }
  }

  function scrollToBoard() {
    boardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function scrollToControls() {
    controlsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const cloudStatus = releaseLoading
    ? 'Finding release world...'
    : releaseError
      ? 'Release lookup error'
      : boardLoading
        ? 'Loading cloud board...'
        : boardError
          ? 'Cloud load error'
          : hasLoadedCloudBoard
            ? 'Cloud board loaded'
            : releaseWorld
              ? 'Project board ready'
              : 'Release world not found';

  const cloudMessage = releaseError?.message || boardError?.message || saveMessage;

  return (
    <main className="signal-board-shell">
      <section className="signal-board-hero">
        <p className="signal-board-kicker">Release World Board</p>
        <h1>{releaseWorld?.title ? `${releaseWorld.title} Signal Board` : 'Release Signal Board'}</h1>
        <p>
          This board resolves the project from the URL slug, loads its artifacts from MongoDB,
          and saves changes back to the same release world.
        </p>

        <div className="signal-board-hero-actions">
          <nav className="signal-board-switch-links" aria-label="Page navigation">
            <Link href={`/releases/${slug}`}>Release Page</Link>
            <Link href="/creator/projects">Project Library</Link>
          </nav>

          <div className="signal-board-focus-actions" aria-label="Board view controls">
            <button type="button" onClick={scrollToBoard}>
              View Board
            </button>
            <button type="button" onClick={scrollToControls}>
              Customize
            </button>
          </div>
        </div>
      </section>

      <section className="signal-board-stage" aria-label="Main interactive board stage">
        <div className="signal-board-stage-header">
          <div>
            <p className="signal-board-panel-kicker">Main Board</p>
            <h2>{releaseTitle}</h2>
          </div>
          <p>
            Drag notes directly on the board. Select a note, then scroll below to refine it.
          </p>
        </div>

        <div className="signal-board-frame-scroll" aria-label="Scrollable board area">
          <section
            ref={boardRef}
            className="signal-board-frame"
            aria-label={`${releaseTitle} signal board`}
          >
            <div className="signal-board-frame-glow" />
            <div className="signal-board-texture" />
            <div className="signal-board-thread signal-board-thread-a" />
            <div className="signal-board-thread signal-board-thread-b" />
            <div className="signal-board-thread signal-board-thread-c" />
            <div className="signal-board-thread signal-board-thread-d" />
            <div className="signal-board-thread signal-board-thread-e" />

            {artifacts.map((artifact) => (
              <BoardArtifactCard
                key={artifact.id}
                artifact={artifact}
                isSelected={artifact.id === selectedArtifactId}
                onPointerDown={handleArtifactPointerDown}
                onDelete={deleteArtifact}
                onLayerNudge={nudgeLayer}
              />
            ))}
          </section>
        </div>

        <div className="signal-board-stage-footer">
          <span>{artifacts.length} artifacts loaded</span>
          <button type="button" onClick={scrollToControls}>
            Scroll to board workshop
          </button>
        </div>

        <div className="signal-board-board-save-zone">
          <div>
            <p className="signal-board-panel-kicker">Board Save</p>
            <h2>Save the studio wall</h2>
            <p>
              Use this after moving cards, adding hooks, deleting notes, or changing board colors.
              Portal Settings save separately near the final pass.
            </p>
          </div>

          <div className="signal-board-cloud-bar">
          <div>
            <span>Mongo status</span>
            <strong>{cloudStatus}</strong>
          </div>
          <p>{cloudMessage}</p>
          <div className="signal-board-cloud-actions">
            <button type="button" onClick={handleReloadCloudBoard}>
              Reload Cloud Board
            </button>
            <button type="button" onClick={handleSaveToCloud} disabled={isSaving || !releaseWorldId}>
              {isSaving ? 'Saving...' : 'Save to Cloud'}
            </button>
          </div>
          </div>
        </div>
      </section>

      <section ref={controlsRef} className="signal-board-controls" aria-label="Signal board controls">
        <div className="signal-board-controls-heading">
          <div>
            <p className="signal-board-panel-kicker">Board Workshop</p>
            <h2>Shape the studio wall</h2>
          </div>
          <p>
            Adjust the generated starter board, edit selected cards, add hooks, and create new artifacts.
            When the wall feels right, move to the Portal Final Pass below.
          </p>
          <button type="button" className="signal-board-return-button" onClick={scrollToBoard}>
            View Board
          </button>
        </div>

        <div className="signal-board-reset-zone">
          <div>
            <p className="signal-board-panel-kicker">Danger zone</p>
            <strong>Reset the local board</strong>
            <span>
              This clears the current local layout and rebuilds the starter board. It will not
              overwrite MongoDB unless you click Save to Cloud.
            </span>
          </div>
          <button type="button" onClick={resetBoard}>
            Reset Board
          </button>
        </div>

        <div className="signal-board-control-grid">
          <div className="signal-board-toolbox-card">
            <p className="signal-board-panel-kicker">Board Theme</p>
            <h2>Starter board</h2>
            <div className="signal-board-style-row" aria-label="Starter board color">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`signal-board-swatch signal-board-swatch-${option.value} ${
                    boardColor === option.value ? 'is-active' : ''
                  }`}
                  onClick={() => applyStarterBoardColor(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="signal-board-tool-note">
              Applies to original generated artifacts only. User-added notes keep their own style.
            </p>
          </div>

          <div className="signal-board-toolbox-card signal-board-selected-card">
            <p className="signal-board-panel-kicker">Selected Artifact</p>
            <h2>{selectedArtifact?.title ?? 'Click a note'}</h2>

            {selectedArtifact ? (
              <>
                <label>
                  Color
                  <select
                    value={selectedArtifact.color ?? 'cream'}
                    onChange={(event) =>
                      updateArtifact(selectedArtifact.id, {
                        color: event.target.value as ArtifactColor,
                      })
                    }
                  >
                    {colorOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Size
                  <select
                    value={selectedArtifact.size ?? 'md'}
                    onChange={(event) =>
                      updateArtifact(selectedArtifact.id, {
                        size: event.target.value as ArtifactSize,
                      })
                    }
                  >
                    {sizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Layer
                  <select
                    value={selectedArtifact.layer ?? 4}
                    onChange={(event) =>
                      updateArtifact(selectedArtifact.id, {
                        layer: Number(event.target.value),
                      })
                    }
                  >
                    {layerOptions.map((layer) => (
                      <option key={layer} value={layer}>
                        Layer {layer}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <p className="signal-board-tool-note">
                Click any original or custom card to customize it.
              </p>
            )}
          </div>

          <div className="signal-board-toolbox-card">
            <p className="signal-board-panel-kicker">New Artifact Style</p>
            <h2>Defaults</h2>

            <div className="signal-board-style-row" aria-label="Sticky note color">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`signal-board-swatch signal-board-swatch-${option.value} ${
                    selectedColor === option.value ? 'is-active' : ''
                  }`}
                  onClick={() => setSelectedColor(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="signal-board-size-row" aria-label="Sticky note size">
              {sizeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={selectedSize === option.value ? 'is-active' : ''}
                  onClick={() => setSelectedSize(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <label>
              Layer priority
              <select value={selectedLayer} onChange={(event) => setSelectedLayer(Number(event.target.value))}>
                {layerOptions.map((layer) => (
                  <option key={layer} value={layer}>
                    Layer {layer}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="signal-board-toolbox-card">
            <p className="signal-board-panel-kicker">Theme Map</p>
            <h2>Hooks by focus</h2>
            <div className="signal-board-theme-map">
              {hookCounts.map((track) => (
                <div key={track.slug}>
                  <span>{track.title}</span>
                  <strong>{track.count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="signal-board-section-divider">
          <div>
            <p className="signal-board-panel-kicker">Create Signals</p>
            <h2>Add hooks and artifacts</h2>
          </div>
          <p>Capture raw material for the world. These are board artifacts first; later they can feed the portal.</p>
        </div>

        <div className="signal-board-create-grid">
          <div className="signal-board-toolbox-card">
            <p className="signal-board-panel-kicker">Hook Lab</p>
            <h2>Add project hooks</h2>

            <label>
              Focus
              <select value={selectedTrackSlug} onChange={(event) => setSelectedTrackSlug(event.target.value)}>
                {focusOptions.map((track) => (
                  <option key={track.slug} value={track.slug}>
                    {track.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Hook title
              <input
                value={hookTitle}
                onChange={(event) => setHookTitle(event.target.value)}
                placeholder="Short hook title"
              />
            </label>

            <label>
              Hook description
              <textarea
                value={hookDescription}
                onChange={(event) => setHookDescription(event.target.value)}
                placeholder="Add the full hook, phrase, theme, or lyric..."
                rows={4}
              />
            </label>

            <button type="button" onClick={addHook}>
              Add Hook Artifact
            </button>
          </div>

          <div className="signal-board-toolbox-card">
            <p className="signal-board-panel-kicker">Artifact Drop</p>
            <h2>Add a custom note</h2>

            <label>
              Tag
              <input
                value={noteTag}
                onChange={(event) => setNoteTag(event.target.value)}
                placeholder="Visual idea, Cover note, Symbol..."
              />
            </label>

            <label>
              Title
              <input
                value={noteTitle}
                onChange={(event) => setNoteTitle(event.target.value)}
                placeholder="Short artifact title"
              />
            </label>

            <label>
              Description
              <textarea
                value={noteBody}
                onChange={(event) => setNoteBody(event.target.value)}
                placeholder="Add the actual note, idea, symbol, clip thought, or reminder..."
                rows={4}
              />
            </label>

            <button type="button" onClick={addNoteArtifact}>
              Add Note Artifact
            </button>
          </div>
        </div>

        <div className="signal-board-section-divider signal-board-section-divider-portal">
          <div>
            <p className="signal-board-panel-kicker">Portal Final Pass</p>
            <h2>Print the world to the release page</h2>
          </div>
          <p>Shape the public-facing portal after the board has enough signal. This updates the dynamic release page.</p>
        </div>

        <div className="signal-board-portal-settings">
          <div className="signal-board-portal-settings-header">
            <div>
              <p className="signal-board-panel-kicker">Portal Settings</p>
              <h2>Final release page copy</h2>
              <p>
                Use this as the final pass after the board has signal. Save these fields,
                then open the Release Page to see the public-facing world update.
              </p>
            </div>

            <div className="signal-board-portal-status">
              <span>ReleaseWorld</span>
              <strong>{releaseWorld?.title ?? 'Loading project...'}</strong>
              <em>{portalMessage}</em>
            </div>
          </div>

          <div className="signal-board-portal-grid">
            <label>
              Release title
              <input
                value={portalSettings.title}
                onChange={(event) => updatePortalSetting('title', event.target.value)}
                placeholder="Release title"
              />
            </label>

            <label>
              Release type
              <select
                value={portalSettings.releaseType}
                onChange={(event) => updatePortalSetting('releaseType', event.target.value)}
              >
                <option value="single">Single</option>
                <option value="ep">EP</option>
                <option value="album">Album</option>
                <option value="campaign">Campaign</option>
              </select>
            </label>

            <label>
              Status
              <select
                value={portalSettings.status}
                onChange={(event) => updatePortalSetting('status', event.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="released">Released</option>
                <option value="archived">Archived</option>
              </select>
            </label>

            <label>
              Visibility
              <select
                value={portalSettings.visibility}
                onChange={(event) => updatePortalSetting('visibility', event.target.value)}
              >
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
                <option value="public">Public</option>
              </select>
            </label>

            <label>
              Current focus
              <input
                value={portalSettings.currentFocus}
                onChange={(event) => updatePortalSetting('currentFocus', event.target.value)}
                placeholder="Lead single / front door"
              />
            </label>

            <label>
              Second focus
              <input
                value={portalSettings.secondFocus}
                onChange={(event) => updatePortalSetting('secondFocus', event.target.value)}
                placeholder="Contrast signal"
              />
            </label>

            <label>
              Drop date
              <input
                type="date"
                value={portalSettings.fullDropDate}
                onChange={(event) => updatePortalSetting('fullDropDate', event.target.value)}
              />
            </label>

            <label className="signal-board-portal-wide">
              One-line summary
              <input
                value={portalSettings.oneLineSummary}
                onChange={(event) => updatePortalSetting('oneLineSummary', event.target.value)}
                placeholder="The public-facing one-line promise of this release world."
              />
            </label>

            <label className="signal-board-portal-wide">
              Story
              <textarea
                value={portalSettings.story}
                onChange={(event) => updatePortalSetting('story', event.target.value)}
                placeholder="Write the release-world story that should appear on the portal."
                rows={5}
              />
            </label>
          </div>

          <div className="signal-board-portal-actions">
            <p>{portalMessage}</p>
            <div>
              <Link href={`/releases/${slug}`}>Open Release Page</Link>
              <button
                type="button"
                onClick={handleSavePortalSettings}
                disabled={isUpdatingPortal || !releaseWorldId}
              >
                {isUpdatingPortal ? 'Saving Portal...' : 'Save Portal Settings'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="signal-board-mobile-list" aria-label="Signal board artifact list">
        {artifacts.map((artifact) => (
          <article
            key={`mobile-${artifact.id}`}
            className={`signal-board-pin signal-board-pin-${artifact.kind} signal-board-pin-color-${
              artifact.color ?? 'cream'
            } signal-board-pin-size-${artifact.size ?? 'md'}`}
          >
            <p className="signal-board-pin-eyebrow">{artifact.eyebrow}</p>
            <h2>{artifact.title}</h2>
            <p>{artifact.body}</p>
            {artifact.meta && <span>{artifact.meta}</span>}
          </article>
        ))}
      </section>
    </main>
  );
}