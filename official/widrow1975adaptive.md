---
title: "Adaptive noise cancelling: principles and applications"
type: paper
domain: active-noise-control
source_type: paper
status: official
citation_key: widrow1975adaptive
authors: [B. Widrow, J. R. Glover, J. M. McCool, J. Kaunitz, C. S. Williams, R. H. Hearn, J. R. Zeidler, E. Dong, R. C. Goodlin]
year: 1975
tags: [anc, adaptive-filter, lms]
drive: []
related: [active-noise-control, fxlms]
created: 2026-06-12
reviewed_by: []
---

## Summary

The foundational paper on adaptive noise cancelling: a reference input correlated with the noise (but not the signal) is adaptively filtered and subtracted from the primary input, with the LMS algorithm driving the filter towards the Wiener solution without prior knowledge of signal statistics.

## Key points

- Cancelling via subtraction of an adaptively filtered reference — no fixed filter design needed.
- LMS adaptation converges to the Wiener filter under stationarity assumptions.
- Demonstrated on ECG, speech, and antenna sidelobe interference — the same structure generalizes across domains.

## Method

Primary input d(n) = s(n) + n0(n); reference x(n) correlated with n0. Adaptive filter output y(n) = wᵀ(n)x(n); error e(n) = d(n) − y(n) is both the system output and the adaptation signal: w(n+1) = w(n) + 2μ e(n) x(n).

## Results

Strong interference rejection in ECG fetal-heartbeat extraction and 60 Hz hum removal; convergence behaviour analysed via eigenvalue spread of the reference autocorrelation matrix.

## My notes

The direct ancestor of [[fxlms]] — FxLMS adds the secondary-path filter into the reference branch to handle acoustic ANC. Read §IV before implementing anything.

## References

- Related cards: [[active-noise-control]], [[fxlms]]
- B. Widrow et al., "Adaptive noise cancelling: principles and applications," *Proc. IEEE*, vol. 63, no. 12, 1975.
