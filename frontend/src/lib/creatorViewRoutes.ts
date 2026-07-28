export function supportsCreatorViewMode(pathname: string | null) {
    if (!pathname) return false;

    if (pathname === "/nexus") {
        return true;
    }

    if (pathname.startsWith("/realms/")) {
        return true;
    }

    const releaseSegments = pathname
        .split("/")
        .filter(Boolean);

    const isReleasePortal =
        releaseSegments.length === 2 &&
        releaseSegments[0] === "releases";

    return isReleasePortal;
}