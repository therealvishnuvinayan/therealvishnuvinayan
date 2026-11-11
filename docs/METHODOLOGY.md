# Public data and disclosure

The profile separates user-supplied professional information from measured public GitHub metadata. Numbers are snapshots, not live counters. The timestamp appears in the artwork, README, and JSON.

## Sources

- [Public account API](https://api.github.com/users/therealvishnuvinayan): public repository and follower counts.
- [Owned public repository API](https://api.github.com/users/therealvishnuvinayan/repos?type=owner&sort=full_name&per_page=100): repository metadata, fully paginated.
- [Public event API](https://api.github.com/users/therealvishnuvinayan/events/public?per_page=100): up to three pages of recent public events.
- [GitHub events documentation](https://docs.github.com/en/rest/activity/events): feed limits and latency.
- [Bamboo Card's public documentation](https://docs.bamboocardportal.com/): the publicly visible Ask AI feature. Vishnu's involvement and production status are supplied by the profile owner, not independently inferred from source code.

The collector uses only unauthenticated GET requests. It rejects private/non-public records, verifies repository ownership, deduplicates repositories and events, and checks repository pagination against the account's public count. Raw repositories, repository names, event payloads, commit messages, email addresses, and source files are not saved.

## Definitions

| Display | Definition |
| :--- | :--- |
| Public repos | All public repositories owned by this account, including forks and archived repositories |
| Non-fork repos | The same set with `fork === false`; this does not certify authorship, originality or licensing of the code |
| Stars | Sum of `stargazers_count` across owned public non-fork repositories; excludes stars on forks and stars the user has given |
| Followers | Public `followers` value; no inferred influence or ranking |
| Primary repository languages | Count of non-fork repositories grouped by GitHub's primary `language`; null becomes `Unspecified`. Not language byte share or proficiency |
| Observed public events | Distinct public events attributed to this username that the feed returned and that fall within the displayed 30 UTC calendar days, including the current partial day |

Language bars use total non-fork repository count as their denominator. If more than four languages are present, the chart shows the top three and an `Other` group; the text table lists every language.

Event bars show daily counts, with the maximum daily value labeled and zero represented by a baseline dot. Daily values are provided in [CSV](../data/activity.csv) and [JSON](../data/github-public.json). PR events may include multiple actions on the same PR; push events are not commit counts. This is not GitHub's contribution calendar, an all-time total, a productivity score, or a measure of private/company work.

GitHub documents a limited recent timeline of up to 300 events and potential latency. The collector limits itself to 300 records and flags a cap when reached. Zero means no matching event was returned in the feed for that day; it does not establish inactivity. The explicit date filter controls the displayed window even if GitHub's retention changes. It excludes future events and records older than the stated range. The collector uses UTC and checks its host clock against GitHub's response date.

Collection is a sequence of API reads, not an atomic database snapshot. Counts may change during a run; detected repository-count inconsistencies fail the refresh. HTTP errors, rate limiting, and malformed data also fail the refresh without fabricating zeros or overwriting the last valid JSON. The existing timestamp makes stale data visible. An unauthenticated GitHub API quota is normally sufficient for one daily run; shared runner limits may occasionally prevent a refresh.

## Featured work

Only the two projects explicitly approved in the brief are featured:

- **Ask AI:** product name, supplied high-level description, employer attribution, and public documentation URL. No company source, credentials, internal diagrams, infrastructure, private URLs, metrics, or implementation claims are included.
- **BizBrain AI:** supplied product name, independent ownership, purpose, and development status. The repository remains private; no repository name, URL, code, or internal implementation is included.

No additional repository was selected or promoted. Aggregate public repository metadata was collected only for statistics. No source-code audit of candidate repositories was performed because no candidates were featured. Before adding another project, verify ownership, license, code quality, employer/customer disclosure rights, and absence of secrets; public visibility alone is not disclosure permission.

Professional positioning, experience, location, core technologies, and project status come from the owner's brief. They are not computed from repository metadata. The neural graph and context/retrieve/reason/act line are original conceptual artwork, not a depiction of either featured project's implementation.

No ranks, streaks, achievements, invented contribution totals, synthetic chart values, or project performance claims are used.
