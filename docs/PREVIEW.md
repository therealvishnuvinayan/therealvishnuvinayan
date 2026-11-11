# Preview and maintain the profile

Everything is local. No GitHub repository has been created or updated, no content has been pushed, and no visibility has been changed.

## Quick preview

From the `therealvishnuvinayan` directory, with Node.js 22 or later:

```sh
npm ci --ignore-scripts
npm run preview
```

Open **http://127.0.0.1:4173**. The server binds only to your machine. Use **Dark**, **Light**, and **Toggle text** to inspect both themes and the accessible profile. Resize the browser or use its device toolbar. Stop with Ctrl+C. Set `PORT=4174 npm run preview` if the port is occupied.

The single-column artwork is selected at viewport widths up to 900px; wider screens use the desktop dashboard. Both themes have distinct exports. The committed PNG and SVG files can also be opened directly without Node.js:

- [Dark desktop](../assets/profile-dark-desktop.png)
- [Dark mobile](../assets/profile-dark-mobile.png)
- [Light desktop](../assets/profile-light-desktop.png)
- [Light mobile](../assets/profile-light-mobile.png)

The local page renders the actual README with a GitHub-style stylesheet and the same image selection rules. It approximates GitHub's layout; final rendering in GitHub's own sanitizer, image cache, and mobile apps can only be checked after an approved publication. Some third-party Markdown viewers ignore GitHub's theme fragments and may display both variants.

## Rebuild and refresh

```sh
npm run build       # Offline: existing JSON → SVG, PNG, README, CSV
npm test            # Data, disclosure, image and Markdown validation
npm run refresh     # Online: fetch public data, rebuild and validate
```

The generator uses bundled, openly licensed IBM Plex fonts and pinned resvg tooling. The SVG text becomes vector outlines and PNGs are rendered at 2× resolution, so the result doesn't depend on installed system fonts. Original text remains in the generator, README, SVG descriptions, and CSV.

Do not hand-edit `README.md`, `assets/profile-*`, or `data/activity.csv`: the next build replaces them. Change profile copy and the text fallback in `scripts/generate.mjs`; change artwork, colors, spacing and layout in `scripts/artwork.mjs`. Public numbers come only from `data/github-public.json` via the collector. Never substitute sample data for a failed refresh.

## Browser validation

```sh
npx playwright install chromium
npm run check:visual
```

Alternatively, point `CHROME_PATH` to an installed Chromium/Chrome executable:

```sh
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run check:visual
```

Checks cover both themes at 320, 375, 600, 768, 900, 901, and 1440px, the image selected at the breakpoint, image decoding, horizontal overflow, expanded accessible text, Markdown tables, and text collisions before SVG outlining. Screenshots and the report are saved in `.preview/`, which is excluded from Git. Browser tests run locally and do not publish anything.

## Optional daily updates

The included workflow is ready for use after publication. Scheduled jobs are skipped until the repository variable `PROFILE_AUTO_REFRESH` is set to `true`; `workflow_dispatch` allows an intentional manual refresh. The schedule is 03:23 UTC / 07:23 UAE time. GitHub may delay scheduled runs and may disable schedules on inactive public repositories; see [GitHub's schedule documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

The collector is unauthenticated and needs no personal access token. The workflow's built-in repository token is used only by Git to commit generated artifacts. A failed fetch exits before replacing the snapshot; the workflow then stops without committing. Branch protection may require adapting the final commit step to your preferred review process.

## Publication, only after approval

The intended destination is `therealvishnuvinayan/therealvishnuvinayan`, with the contents of this directory at its root. The public lookup returned 404 during preparation; this means it was not publicly accessible, not proof that a private repository does not exist. Check for an existing repository with the account owner before creating one.

A GitHub profile README requires a public repository matching the username and a root `README.md`, as described in [GitHub's profile README documentation](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme). Review the assets, text and data first. Creation of the remote, pushing files, and any visibility change remain separate actions that require your approval. This project includes no automated publishing command.

The local directory is a standalone Git repository with no remote configured. Dependencies and browser screenshots are ignored. Preserve `assets/fonts/OFL.txt` and `docs/ATTRIBUTION.md` when publishing.
