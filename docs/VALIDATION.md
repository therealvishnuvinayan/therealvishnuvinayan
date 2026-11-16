# Local validation

Validated on 16 November 2026 using Node.js 22.23.5 and installed Google Chrome through Playwright. This content refresh was not committed or pushed.

| Check | Result |
| :--- | :--- |
| Public API data | Existing unauthenticated collector refreshed the [snapshot](../data/github-public.json); public repository pagination/count and host-clock checks passed; README and SVG timestamps match the fresh snapshot |
| Public-data aggregation | Five tests passed: visibility/ownership filtering, fork exclusion, incomplete pagination, deduplication/date boundaries, empty data, and capped feeds |
| Responsive rendering | 14 cases passed: dark and light at 320, 375, 600, 768, 900, 901, and 1440px |
| Theme and breakpoint | Exactly one theme displayed; the correct single-column or desktop PNG loaded |
| Image integrity | All four PNGs decoded; desktop 2400 × 4080, mobile 960 × 6720; all four SVGs parsed as XML |
| Text layout | No SVG glyph clipping or text collisions in desktop/mobile source artwork |
| Markdown | Three accessible tables rendered; profile details expanded; local image/link targets resolved; no horizontal page overflow |
| Data alternatives | CSV daily counts and event-type counts matched the JSON total |
| Disclosure checks | Explicitly authorized public BizBrainAI URL allowed; company-source link restriction retained; generated data excludes repository names and event payloads; credential-pattern scan passed |
| Project content | Public project READMEs corroborate the separate BizBrainAI demo/backend and Video Sentiment Model's experimental verification scope; no outdated private-source claim remains |
| Reproducibility | Offline rebuild produced byte-identical README, CSV, and eight artwork files |
| Fonts | Bundled font checksums matched; SIL Open Font License included |
| Design preservation | All four artwork variants retain identical geometry, fonts, colors, and text positions against the previous generator with the same input data; two project cards retained; all prior external README links preserved |
| Manual visual review | Reviewed browser screenshots of desktop and mobile artwork in both dark and light themes |

The local preview approximates GitHub's Markdown styling and theme filters. GitHub-hosted rendering, image caching, GitHub mobile apps, and the Actions workflow were not exercised for this refresh. Local screenshots and the machine-readable browser report are in `.preview/` and are intentionally ignored by Git.
