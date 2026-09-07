# Happy Golf Scorecard v4.0 Commercial Stabilization

## Core reliability
- Every score edit is immediately mirrored to a local recovery draft.
- Server save failures no longer risk losing the latest hole data.
- App restart recovery banner restores unfinished local drafts.
- Multiple in-progress rounds are surfaced on Home instead of silently hiding all but one.
- Draft is removed only after successful synchronization or intentional termination.

## UX / visual system
- Strengthened commercial visual hierarchy and recovery feedback.
- Multiple active rounds use a clear progress indicator.
- Mobile-first cards, touch feedback and safer visual states retained.

## Engineering
- Version raised to 4.0.0.
- Vitest test command prepared for regression testing.

## Remaining production recommendation
Before public launch, run Firebase Emulator + Playwright regression scenarios for offline, reconnect, multi-device editing, delete failure and 9/18-hole edge cases.
