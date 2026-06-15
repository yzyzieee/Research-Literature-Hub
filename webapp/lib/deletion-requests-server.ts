import {
  CARD_DELETION_REQUESTS_FILE,
  EMPTY_CARD_DELETION_REGISTRY,
  normalizeDeletionRegistry,
} from "./deletion-requests";
import {
  decodeGitHubFile,
  readGitHubFile,
  writeGitHubFile,
} from "./github-content";

export async function readDeletionRequests() {
  try {
    const file = await readGitHubFile(CARD_DELETION_REQUESTS_FILE);
    return {
      registry: normalizeDeletionRegistry(JSON.parse(decodeGitHubFile(file))),
      sha: file.sha,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "File not found." || error.message.includes("not configured"))
    ) {
      return { registry: EMPTY_CARD_DELETION_REGISTRY };
    }
    throw error;
  }
}

export async function writeDeletionRequests(
  registry: ReturnType<typeof normalizeDeletionRegistry>,
  sha?: string,
) {
  await writeGitHubFile({
    path: CARD_DELETION_REQUESTS_FILE,
    content: JSON.stringify(normalizeDeletionRegistry(registry), null, 2) + "\n",
    message: "team: update card deletion requests",
    sha,
  });
}
