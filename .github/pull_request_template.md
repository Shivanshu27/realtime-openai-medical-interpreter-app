## Summary of Changes

A concise description of what this pull request addresses, fixes, or enhances.

## Motivation & Clinical Context

Why is this change necessary? How does it affect doctor-patient interpretation flow or system reliability?

## Architectural Checklist

- [ ] Does NOT expose master API keys to the client (`REACT_APP_...`).
- [ ] Maintains backward compatibility for legacy API endpoints.
- [ ] Degrades gracefully if external services (MongoDB, OpenAI) are offline.
- [ ] New clinical extraction terms or repetition triggers include unit test coverage.
- [ ] Existing automated tests pass cleanly (`npm test`).

## Testing & Verification

Describe the manual or automated testing performed:
- [ ] Tested in Interactive Simulation Mode (`MOCK_MODE=true`)
- [ ] Tested with live WebRTC connection (if applicable)
- [ ] Verified summary export output
