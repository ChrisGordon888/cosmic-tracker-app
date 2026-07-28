export function supportsCreatorViewMode(pathname: string | null) {
    if (!pathname) return false;

    return (
        pathname === "/nexus" ||
        pathname.startsWith("/releases/")
    );
}
