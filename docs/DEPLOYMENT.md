# Deployment

This guide deploys Research Literature Hub with GitHub as the record store, Vercel as the
web runtime, and optional Google Drive storage.

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
the login form does not enumerate them. `LOGIN_ALLOWED_ACCOUNTS` controls which active
account IDs may sign in and defaults to `YZY`. Account matching is case-insensitive.
This username-only login is lightweight team identification, not a high-assurance
identity provider. Put the deployment behind appropriate Vercel access controls when
stronger protection is required.

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

Choose one server-side authorization method:

- Owner OAuth client ID, client secret, and refresh token.
- A service-account JSON object stored as one environment variable, with access to an
  appropriate Workspace location.

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
