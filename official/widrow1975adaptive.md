---
title: 'Adaptive noise cancelling: principles and applications'
entry_type: literature
primary_domain: active-noise-control
domains:
  - active-noise-control
  - fundamentals-dsp
publication_type: journal-paper
venue: Proceedings of the IEEE
doi: 10.1109/PROC.1975.10036
abstract: ''
status: official
citation_key: widrow1975adaptive
authors:
  - B. Widrow
  - J. R. Glover
  - J. M. McCool
  - J. Kaunitz
  - C. S. Williams
  - R. H. Hearn
  - J. R. Zeidler
  - E. Dong
  - R. C. Goodlin
year: 1975
tags:
  - anc
  - adaptive-filter
  - lms
key_references: []
drive: []
related:
  - active-noise-control
  - fxlms
created: '2026-06-12'
reviewed_by:
  - YZY
rating:
  recommendation: 3
  innovation: 3
  rigor: 3
  weight: 60
  count: 1
ratings:
  - reviewer: YZY
    recommendation: 3
    innovation: 3
    rigor: 3
    updated: '2026-06-14'
activity:
  - action: rating_added
    by: YZY
    at: '2026-06-14T07:42:05.782Z'
    detail: 'recommendation=3, innovation=3, rigor=3'
---
## Summary

This foundational paper presents adaptive noise cancelling as a general estimation problem: a reference input correlated with unwanted interference is adaptively filtered and subtracted from the primary input. The LMS algorithm drives the filter toward the Wiener solution without requiring prior knowledge of signal statistics.

## Problem

A fixed cancellation filter cannot reliably follow changing interference paths or unknown signal statistics. The paper asks whether an adaptive filter can estimate unwanted noise from a correlated reference while preserving the desired signal in the primary channel.

## Method

The primary input combines the desired signal with unwanted interference:

$$
d(n)=s(n)+n_0(n).
$$

A reference vector $\mathbf x(n)$ is correlated with the interference $n_0(n)$ but ideally uncorrelated with the desired signal $s(n)$. The adaptive filter estimates the interference and subtracts it:

$$
y(n)=\mathbf w^{\mathsf T}(n)\mathbf x(n),
\qquad
e(n)=d(n)-y(n).
$$

The residual $e(n)$ is both the system output and the signal used to update the filter through LMS:

$$
\mathbf w(n+1)
=
\mathbf w(n)
+
2\mu e(n)\mathbf x(n).
$$

Here, $\mathbf w(n)$ is the adaptive-filter coefficient vector and $\mu$ is the step size. Under the paper's stationarity and independence assumptions, minimizing the mean-square value of $e(n)$ drives the coefficients toward the Wiener solution.

## Key results

The paper demonstrates strong interference rejection in fetal-heartbeat extraction, 60 Hz hum removal, speech processing, and antenna sidelobe cancellation. It also relates convergence speed to the eigenvalue spread of the reference autocorrelation matrix.

## Strengths

The paper establishes a reusable adaptive cancellation structure and demonstrates it across several application domains. Its formulation connects practical LMS adaptation to the Wiener solution without requiring prior signal statistics.

## Limitations

The analysis relies on stationarity and reference-signal assumptions that may not hold in rapidly changing acoustic systems. It also predates the secondary-path treatment required by practical acoustic ANC.

## Relevance to our group

This is the direct conceptual ancestor of the FxLMS controller: FxLMS adds a secondary-path model to the reference branch so that LMS adaptation remains meaningful through the electro-acoustic plant.

## Notes

Read the convergence analysis before selecting the LMS step size. For acoustic ANC implementation, continue with the related `fxlms` card and secondary-path modeling literature.
