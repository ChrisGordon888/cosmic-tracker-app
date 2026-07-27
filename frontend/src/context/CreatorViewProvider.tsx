"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { usePlatformAccess } from "@/context/PlatformAccessProvider";

export type CreatorViewMode = "creator" | "public-preview";

interface CreatorViewContextValue {
    viewMode: CreatorViewMode;
    isCreatorView: boolean;
    isPublicPreview: boolean;
    setViewMode: (mode: CreatorViewMode) => void;
    toggleViewMode: () => void;
}

const STORAGE_KEY = "cosmic-creator-view-mode";
const CreatorViewContext = createContext<CreatorViewContextValue | null>(null);

export function CreatorViewProvider({ children }: { children: ReactNode }) {
    const { canAccessCreatorOS } = usePlatformAccess();
    const [viewMode, setViewModeState] =
        useState<CreatorViewMode>("creator");

    useEffect(() => {
        if (!canAccessCreatorOS) {
            setViewModeState("creator");
            return;
        }

        const storedMode = window.sessionStorage.getItem(STORAGE_KEY);
        if (storedMode === "public-preview" || storedMode === "creator") {
            setViewModeState(storedMode);
        }
    }, [canAccessCreatorOS]);

    const setViewMode = useCallback(
        (mode: CreatorViewMode) => {
            if (!canAccessCreatorOS) return;

            setViewModeState(mode);
            window.sessionStorage.setItem(STORAGE_KEY, mode);
        },
        [canAccessCreatorOS],
    );

    const toggleViewMode = useCallback(() => {
        setViewMode(
            viewMode === "creator" ? "public-preview" : "creator",
        );
    }, [setViewMode, viewMode]);

    const value = useMemo<CreatorViewContextValue>(
        () => ({
            viewMode,
            isCreatorView: viewMode === "creator",
            isPublicPreview: viewMode === "public-preview",
            setViewMode,
            toggleViewMode,
        }),
        [setViewMode, toggleViewMode, viewMode],
    );

    return (
        <CreatorViewContext.Provider value={value}>
            {children}
        </CreatorViewContext.Provider>
    );
}

export function useCreatorView() {
    const context = useContext(CreatorViewContext);

    if (!context) {
        throw new Error(
            "useCreatorView must be used inside CreatorViewProvider",
        );
    }

    return context;
}
