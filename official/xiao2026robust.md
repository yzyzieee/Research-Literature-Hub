---
title: 'Robust Soft-Constrained Spatially Selective Active Noise Control for Hearables Under Secondary Path Variations'
entry_type: literature
primary_domain: active-noise-control
domains:
  - active-noise-control
  - spatial-audio
publication_type: preprint
venue: arXiv
doi: 10.48550/arXiv.2605.17407
abstract: >-
  A robust soft-constrained spatially selective ANC design averages its objective
  over measured secondary-path estimates. Simulations and real-time experiments
  show a narrower performance spread under path mismatch with a small reduction
  in mean performance.
status: official
citation_key: xiao2026robust
authors:
  - Tong Xiao
  - Reinhild Roden
  - Matthias Blau
  - Simon Doclo
year: 2026
tags:
  - anc
  - spatially-selective-anc
  - secondary-path
  - robust-optimization
  - hearables
key_references:
- title: Spatially Selective Active Noise Control for Open-Fitting Hearables with Acausal Optimization
  doi: 10.61782/fa.2025.0817
  year: 2025
  role: baseline
  reason: Provides the acausal SSANC controller that the robust formulation extends under path variation.
  status: in_library
  linked_card: xiao2025spatially
- title: Soft-constrained spatially selective active noise control for open-fitting hearables
  doi: ''
  year: 2025
  role: method
  reason: Introduces the soft-constrained objective used as the basis of the robust average-cost design.
  status: external
  linked_card: null
- title: Spatially selective active noise control systems
  doi: ''
  year: 2023
  role: foundation
  reason: Establishes the direction-selective ANC problem and core system formulation.
  status: external
  linked_card: null
- title: Data-driven uncertainty modeling for robust feedback active noise control in headphones
  doi: ''
  year: 2024
  role: related_work
  reason: Provides a related data-driven treatment of acoustic-path uncertainty for headphone ANC.
  status: external
  linked_card: null
- title: Robust single- and multi-loudspeaker least-squares-based equalization for hearing devices
  doi: ''
  year: 2022
  role: method
  reason: Demonstrates robust optimization across measured hearing-device transfer-function variation.
  status: external
  linked_card: null
drive:
  - https://drive.google.com/file/d/169kOYOzTtUgqYjPNuKq5fUHW2Si3_OLR/view?usp=drivesdk
related: []
created: '2026-06-13'
reviewed_by: []
---
## Summary

This paper addresses secondary-path variation in spatially selective active noise control for hearables. It computes one soft-constrained controller by averaging the optimization objective over a set of measured secondary-path estimates. Simulations and real-time experiments show that the robust controller gives up a small amount of matched-path performance in exchange for substantially more consistent behavior across users and device fits.

## Problem

The acoustic path from a hearable loudspeaker to its inner error microphone changes with ear anatomy and device placement. A controller optimized for one nominal path can therefore lose attenuation, distort desired speech, or approach instability when deployed under a different path.

## Method

The method begins with a soft-constrained SSANC objective that balances residual noise, desired-speech preservation, and control effort. Instead of optimizing the control filter $\mathbf w$ for one secondary-path estimate, the robust design averages the cost over $J$ path estimates:

$$
\min_{\mathbf w}
\frac{1}{J}
\sum_{j=1}^{J}
\left[
\mathbb E\!\left\{e_j^2(n)\right\}
+
\mu
\left\lVert
\mathbf H
\left(
\mathbf q+\widehat{\mathbf G}_j\mathbf w
\right)
-
\alpha\boldsymbol{\delta}_{\Delta}
\right\rVert_2^2
\right]
+
\mathbf w^{\mathsf T}\mathbf B\mathbf w.
$$

Here, $e_j(n)$ is the error signal under path estimate $\widehat{\mathbf G}_j$, $\mu$ controls the speech-preservation penalty, $\mathbf H$ contains relative impulse responses, $\alpha\boldsymbol{\delta}_{\Delta}$ is the desired delayed speech response, and $\mathbf B$ regularizes control effort.

The closed-form filter replaces the single-path normal equations with averages across the path set:

$$
\mathbf w_{\mathrm{robust}}
=
-
\left(
\boldsymbol{\Phi}_{rr}
+
\frac{\mu}{J}
\sum_{j=1}^{J}
\widehat{\mathbf G}_j^{\mathsf T}
\mathbf H^{\mathsf T}\mathbf H
\widehat{\mathbf G}_j
\right)^{-1}
\left[
\boldsymbol{\phi}
-
\frac{\mu}{J}
\sum_{j=1}^{J}
\widehat{\mathbf G}_j^{\mathsf T}
\mathbf H^{\mathsf T}
\left(
\alpha\boldsymbol{\delta}_{\Delta}
-
\mathbf H\mathbf q
\right)
\right].
$$

The matrix $\boldsymbol{\Phi}_{rr}$ and vector $\boldsymbol{\phi}$ collect averaged second-order signal terms. Three cases are compared: a matched oracle controller, a controller trained on one mismatched path, and the proposed controller trained across the path set.

## Key results

The matched oracle gives the best mean performance. The single-path mismatched controller shows a much wider outcome distribution, including roughly a 6 dB spread in noise reduction between lower and upper percentiles. The robust controller keeps mean performance near the mismatched case while substantially narrowing the spread. Real-time measurements follow the same trend as the simulations.

## Strengths

The work targets a practical source of deployment failure and evaluates it with both simulations and real-time experiments. Reporting performance distributions rather than only mean values makes the robustness gain visible.

## Limitations

The result depends on how representative the training path set is of future users and fits. Average-cost optimization does not directly protect against rare worst-case paths, and the trade-off between mean performance and consistency requires application-specific tuning.

## Relevance to our group

This paper provides a practical route from laboratory SSANC performance to controllers that tolerate fitting variation. Its evaluation framework is also useful beyond hearables: measured-path ensembles and percentile-based reporting should be considered for any ANC design intended for multiple users or changing geometries.

## Notes

Compare average-cost robustness with worst-case and distributionally robust formulations before selecting a controller for deployment. The path-set collection protocol is likely as important as the optimizer itself.
