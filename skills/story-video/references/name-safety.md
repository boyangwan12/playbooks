# Invented names: how to pick them and check them

The video and the demo app show a sample company, its customers and its vendors. If any of those names belong to a real business, the post can create a legal or reputational problem. This was raised late in the POC_02 project and forced a rename of the app, the data, the screens and the video. Do this at the start.

## What must be invented
Everything readable on screen or spoken: the company, its customers, vendors, product-like names inside the sample data, and people. Names that are cropped or small still count if a frame shows them. Do not try to vet 100 generated customer names; make sure the ones that can be read are the ones you checked (the "canonical" customers the story names), and keep generated ones to generic place-style prefixes.

## How to coin
- Two-part coined names that are not dictionary words: e.g. `Aldervane`, `Dovemoor`, `Ashmoor`, `Tessaly`, `Ledgerwick`, `Hollinreach`, `Kaimori`.
- Match the setting if the user asks (the user wanted the bakery to sound Asian: `Kaimori Bakery`).
- Short form must also work on a name card (`Kaimori`).
- Avoid: real place-name constructions that are a real chain (`Grand Meridian Hotels` is close to Le Meridien and real hotels), generic phrases that many small businesses use (`Crumb & Co.`, `Brightside Cafe`), characters or brands (`Hoshimaru` is a manga character), and names that look like the user's own company or clients (`Pellwick` was rejected because the user's agency is called Halderwick).
- Ask the user whether their agency, clients or partners have names to stay away from.

## How to check
1. For each candidate run an exact-phrase web search: `"Name Bakery"`, `"Name Bakehouse"`, then the bare name `"Name"` with the business type.
2. Reject on any business, product, character or trademark hit. Near-miss hits (similar spelling) are acceptable but mention them.
3. Record the checked names in `STORY.md` ("Invented names only ...").
4. Say plainly: **this lowers the risk and is not a trademark clearance**; for a public post the user or counsel should run a proper trademark check.

## Changing names later (what it touches)
App source and UI, fixtures and the data generator (names only, keep list lengths so every number stays identical; diff old vs new data after mapping names to prove it), tests, answer-key files, evidence JSON, READMEs, the video narration, the choreography text, **re-capture the app screens**, rebuild, re-render, **re-bake the poster** (the poster is a video frame and keeps the old name otherwise). Finish with a grep for every old name and a look at a frame.
