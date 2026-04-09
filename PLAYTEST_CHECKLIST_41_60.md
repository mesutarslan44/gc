# 41-60 Campaign Playtest Checklist

## Device Matrix
- Android low-end (4 GB RAM) - 20 minutes run, no stutter spikes above 2 seconds.
- Android mid/high (8+ GB RAM) - run levels 41, 50, 55, 60 back to back.
- Optional iOS sanity pass - verify touch drag and long-press consistency.

## Core Flow Validation
- Level intro card appears on 41-60 and closes correctly.
- Player can only send ships over linked planets.
- Drag target highlight appears only on valid linked targets.
- Multi-select refuses disconnected planets with warning feedback.

## Campaign Balance Pass (Quick)
- 41-44: Player can win with one major mistake allowed.
- 45-49: Pressure increase is noticeable but not abrupt.
- 50 boss: Requires setup play; still beatable in 1-3 retries.
- 51-59: Two-base coordination feels rewarded over random spam.
- 60 boss: Clear final spike, but not luck-only.

## Performance and UX
- No frame drops during simultaneous wave attacks (player + AI).
- Camera shake and impact flash do not block touch input.
- Win/lose modal metrics render correctly after long matches.
- No visual overlap issues on small-screen devices.

## Regression Checks
- Tutorial still only shows on level 1 first run.
- Levels 1-40 gameplay remains unchanged.
- Power-up inventory resets correctly on retry.
- Progress unlock (stars, next level unlock) still writes correctly.
