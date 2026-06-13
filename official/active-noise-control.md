---
title: Active noise control (ANC)
type: concept
domain: active-noise-control
status: official
tags: [anc, acoustics]
drive: []
related: [widrow1975adaptive, fxlms]
created: 2026-06-12
reviewed_by: []
---

## Summary

Active noise control cancels unwanted sound by generating an "anti-noise" signal of equal amplitude and opposite phase through secondary sources (loudspeakers), exploiting destructive interference. It is most effective at low frequencies where passive absorption is bulky and inefficient.

## Key points

- Complements passive control: ANC for low frequency, passive materials for high frequency.
- Needs a reference or error sensor; performance hinges on the secondary path (speaker→error mic) estimate.
- Feedforward, feedback and hybrid structures; adaptive algorithms (e.g. [[fxlms]]) track changing noise.

## Intuition

Two identical waves shifted by half a wavelength sum to silence. The controller's whole job is producing that shifted copy fast enough and accurately enough at the listening point.

## Math

Residual error at the error microphone: e(n) = d(n) + s(n) * y(n), where d(n) is primary noise, y(n) the controller output, s(n) the secondary-path impulse response, and * convolution. The controller minimizes E[e²(n)].

## My notes

Starting point for the team's headphone / duct ANC experiments; see the paper card [[widrow1975adaptive]] for the adaptive-filtering origin.

## References

- Related cards: [[widrow1975adaptive]], [[fxlms]]
- S. M. Kuo and D. R. Morgan, *Active Noise Control Systems*, Wiley, 1996.
