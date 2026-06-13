---
title: Filtered-x LMS (FxLMS)
type: algorithm
domain: active-noise-control
status: reviewed
tags: [anc, adaptive-filter, fxlms]
drive: []
related: [active-noise-control, widrow1975adaptive]
created: 2026-06-12
reviewed_by: []
---

## Summary

FxLMS is the workhorse adaptive algorithm of active noise control: standard LMS diverges when a secondary path S(z) sits between the controller output and the error sensor, so FxLMS filters the reference signal through an estimate Ŝ(z) before the weight update, restoring gradient alignment.

## Key points

- Tolerates secondary-path phase error up to ±90°; beyond that it diverges.
- Convergence slows as the delay in S(z) grows; step size must shrink accordingly.
- Ŝ(z) is usually identified offline with white noise, or online with auxiliary noise injection.

## Method

```text
x'(n) = ŝ(n) * x(n)              # filter reference through secondary-path estimate
y(n)  = wᵀ(n) x(n)               # controller output to loudspeaker
e(n)  = d(n) + s(n) * y(n)       # residual at error microphone
w(n+1) = w(n) − μ e(n) x'(n)     # FxLMS weight update
```

## When to use

Default choice for feedforward ANC in ducts, headphones and vehicle cabins. Consider FxNLMS for varying reference power, leaky FxLMS against weight drift, and frequency-domain variants for long filters.

## Implementation notes

Normalize step size by filtered-reference power; watch for output saturation driving nonlinearity in the secondary path.

## My notes

Draft for review — please check the ±90° phase bound citation before promoting.

## References

- Related cards: [[active-noise-control]], [[widrow1975adaptive]]
- S. M. Kuo and D. R. Morgan, "Active noise control: a tutorial review," *Proc. IEEE*, vol. 87, no. 6, 1999.
