# EXERGY carousel voice and structure

Taken from EXERGY's own proposal-drafting carousel (LinkedIn, Nov 2026, five slides, DM Sans on cream paper, logo bottom-left, "01 / 05" bottom-right).

## Slide roles
1. **The Problem.** A concrete scene in second person ("You run a social media agency..."), what still has to be done, a bold closing line ("Tomorrow is almost over. You still need to write it.").
2. **The Ripple Effect.** What the problem pushes onto everything else; a bold closing line about accumulation ("Every new opportunity adds more work to an already full day.").
3. **The Solution.** "What if...?" then what EXERGY built (for one of its clients as part of its Pilot Program, in their case); a bold line about the human staying in control ("You review and edit before sending.").
4. **Proof of Concept.** Three or four bold lead phrases with one plain sentence each (relevant company information, traceable sources, visible gaps), a bold closing line, then "Check our next post to see the POC in action."
5. **The Invitation.** Widen it: "Maybe it isn't X. Maybe it's Y, Z...". Then "If something in your work keeps taking more time than it should, we'd like to hear about it." Bold: "Let's explore what we could help you with!" and `contact@exergylabs.ai`.

## Voice
Plain, calm, second person, short sentences. No hype words, no emojis in slides. Bold is reserved for the closing line of each slide and the lead phrases on the proof slide. Titles end with a full stop.

## Typography and layout (the template matches this; measured from EXERGY's own carousel)
Typeface: **standard DM Sans** (the `@fontsource-variable/dm-sans` wght file, NOT the optical-size `opsz` file: the opsz version sets tighter and wraps differently). Measured by typesetting the coworker's first paragraph and matching his line breaks exactly:
- Title: **62 px** (on a 1080 px wide slide), weight ~330, line-height 1.05, normal letter-spacing.
- Body: **34.5 px**, weight ~330, line-height **1.4**, colour dark charcoal (#2e2e2c); bold (600) only for the closing line and proof-slide lead phrases.
- Cream background (#f4f1e9), text block starting 96 px from the top, 88 px side margins, logo (dark) bottom-left, "01 / 05" bottom-right.
- Use true weights only (the variable font has no italic: do not fake one; an earlier EXERGY slide used a different font for one line and looked like a late edit).
- If you must re-measure: crop the original slide, typeset the same sentence at candidate sizes in a 1080 px page, and compare where the lines break.

## Framing rules
- "We built this for a client" is a claim. Use it only when true. For an invented example business use "Picture a..." and "an EXERGY proof of concept".
- Real numbers only; each one should appear in the product or its data.
- Do not promise outcomes: "see the gap early", "test a fix first", not "never run out of cash".

## Keeping a carousel consistent with EXERGY's own
Reuse the section titles in order (The Problem. / The Ripple Effect. / The Solution. / Proof of Concept. / The Invitation.); a title may be replaced where the original does not fit the picture (the data-line carousel uses "Week six." for slide 2). Reuse the phrasing patterns: "That's what EXERGY built ... as a proof of concept", bold lead phrase + one sentence on the proof slide, the closing line "Check our next post to see the POC in action.", and the invitation wording ("If something in your work keeps taking more time than it should, we'd like to hear about it." / "Let's explore what we could help you with!" / `contact@exergylabs.ai`). The worked example is `assets/example-line-chart/slides.json`.
