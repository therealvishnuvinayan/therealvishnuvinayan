# Local validation

Validated on 11 November 2026 using Node.js 22.12.0 and installed Google Chrome through Playwright. No remote repository was created or changed.

| Check | Result |
| :--- | :--- |
| Public API data | Independent comparison matched 20 public repositories, 15 non-forks, 3 stars on non-forks, language counts, and 27 observed events in the displayed window |
| Public-data aggregation | Five tests passed: visibility/ownership filtering, fork exclusion, incomplete pagination, deduplication/date boundaries, empty data, and capped feeds |
| Responsive rendering | 14 cases passed: dark and light at 320, 375, 600, 768, 900, 901, and 1440px |
| Theme and breakpoint | Exactly one theme displayed; the correct single-column or desktop PNG loaded |
| Image integrity | All four PNGs decoded; desktop 2400 × 4080, mobile 960 × 6720; all four SVGs parsed as XML |
| Text layout | No SVG glyph clipping or text collisions in desktop/mobile source artwork |
| Markdown | Three accessible tables rendered; profile details expanded; local image/link targets resolved; no horizontal page overflow |
| Data alternatives | CSV daily counts and event-type counts matched the JSON total |
| Disclosure checks | No private repository URL or company-source link in README; generated data excludes repository names and event payloads; credential-pattern scan passed |
| Reproducibility | Offline rebuild produced byte-identical README, CSV, and eight artwork files |
| Fonts | Bundled font checksums matched; SIL Open Font License included |
| Manual visual review | Reviewed dark desktop/mobile artwork and browser screenshots of light desktop and dark mobile |

The local preview approximates GitHub's Markdown styling and theme filters. GitHub-hosted rendering, image caching, GitHub mobile apps, and the Actions workflow have not been exercised on a remote because publication is awaiting approval. Local screenshots and the machine-readable browser report are in `.preview/` and are intentionally ignored by Git.
