# Deployment

This guide deploys Research Literature Hub with GitHub as the record store, Vercel as the
web runtime, and optional Google Drive storage.

## Storage topology

Prepare two destinations before deployment:

1. A **team file-storage address** for original PDFs. The included adapter uses a shared
   Google Drive folder. This layer can remain private or team-only.
2. A **public summary-repository address** for structured literature records, reviews,
   comments, indexes, and LLM catalogs. The included implementation uses a public GitHub
   repository.

The application writes each confirmed paper to both layers: the PDF is archived in file
storage, while its structured Markdown record and PDF reference are published to GitHub.
PDF binaries are not committed to the repository.

## 1. Prepare the repository

1. Clone the software into a repository you control, such as
   `research-literature-hub`.
2. Keep the default branch as `main`.
3. Enable GitHub Actions with read/write workflow permissions.
4. Enable private vulnerability reporting under repository security settings.
5. Do not add PDFs or credentials to Git.

## 2. Create a GitHub token

Create a fine-grained personal access token restricted to this repository. Grant only
the repository Contents read/write permission required by publishing, ratings, comments,
and team configuration.

Set:

```text
GITHUB_TOKEN=<server-only token>
GITHUB_REPO=owner/research-literature-hub
NEXT_PUBLIC_GITHUB_REPO=owner/research-literature-hub
GITHUB_BASE=main
```

`NEXT_PUBLIC_GITHUB_REPO` is intentionally public. `GITHUB_TOKEN` is not.

## 3. Import into Vercel

1. Import the GitHub repository as a new Vercel project.
2. Set **Root Directory** to `webapp`.
3. Keep the detected Next.js framework settings.
4. Add environment variables for Production and any Preview environment that should
   support writes.
5. Deploy.

Use the project name `research-literature-hub` unless your Vercel team already has that
name.

## 4. Configure authentication

Generate a long random `AUTH_SECRET`. Team accounts are stored in `team/members.json`;
the login form does not enumerate them. Any active account in that file can sign in,
and account matching is case-insensitive. Administrators can add an account from
**Settings**; it becomes available immediately without changing deployment variables.
This username-only login is lightweight team identification, not a high-assurance
identity provider. Put the deployment behind appropriate Vercel access controls when
stronger protection is required.

Administrators create only an account ID and display name. New members are redirected
to Settings on first login to choose their own research domains. Every active member can
view the team's names and selected domains in the team directory.

### Guest demo mode

Every deployment includes a virtual `GUEST` account and a **Continue as Guest** button.
Guest mode is a product demonstration, not a team account:

- extraction and draft generation use deterministic local sample data;
- PDF archiving and publishing return simulated success results;
- ratings, comments, and profile changes exist only in the current response/UI state;
- no guest action writes to GitHub, Google Drive, or `team/members.json`;
- no configured LLM provider is called for guest extraction.

This allows a public deployment to demonstrate the complete workflow without consuming
API quota or modifying the real library. It is not a security boundary for the team
accounts; use Vercel access controls or a real identity provider when stronger
authentication is required.

## 5. Configure optional LLM extraction

Set `LLM_PROVIDER` and only the matching provider key/model variables. Use a low-cost
model for metadata drafting, verify generated content before publishing, and apply
provider-side spending limits.

## 6. Configure optional Google Drive storage

Set:

```text
DRIVE_FOLDER_ID=<folder id>
NEXT_PUBLIC_DRIVE_UPLOAD=1
NEXT_PUBLIC_DRIVE_FOLDER_URL=<folder URL>
```

Configure one or both server-side authorization methods:

- Owner OAuth client ID, client secret, and refresh token.
- A service-account JSON object stored as one environment variable, with access to an
  appropriate Workspace location.

When both are configured, the app prefers owner OAuth and automatically falls back to
the service account if refreshing OAuth fails. The folder identified by
`DRIVE_FOLDER_ID` must be shared with the service account's `client_email`.

For owner OAuth, publish the Google OAuth consent screen to **Production** before
long-term use. Refresh tokens issued while the app remains in **Testing** may expire
after seven days. Service accounts are best suited to Workspace Shared Drives; for a
personal My Drive folder that must accept uploads, keep valid owner OAuth configured.

Never expose these values with a `NEXT_PUBLIC_` prefix.

## 7. Verify the deployment

1. Confirm the footer version matches the latest GitHub workflow commit.
2. Sign in with a configured team account.
3. Browse a literature record.
4. Test a non-sensitive sample PDF through extraction and storage.
5. Publish a test record and confirm that GitHub, the generated index, and Vercel update.
6. Copy each **Use with My LLM** mode and verify its repository URLs.

## Repository or Vercel renames

After renaming the GitHub repository, update `GITHUB_REPO` and
`NEXT_PUBLIC_GITHUB_REPO`, then redeploy. GitHub redirects old repository URLs, but
generated raw-content links should be rebuilt by running `python scripts/update_index.py`
or triggering the maintenance workflow.

After renaming the Vercel project, verify its production domain and update any bookmarks,
OAuth allowlists, CORS allowlists, or external links that used the previous domain.
