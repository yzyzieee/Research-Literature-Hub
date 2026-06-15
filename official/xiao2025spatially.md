---
title: 'Spatially Selective Active Noise Control for Open-Fitting Hearables with Acausal Optimization'
entry_type: literature
primary_domain: active-noise-control
domains:
  - active-noise-control
  - spatial-audio
  - beamforming-arrays
publication_type: conference-paper
venue: Forum Acusticum Euronoise 2025
doi: 10.61782/fa.2025.0817
abstract: >-
  An acausal relative-impulse-response formulation is introduced for spatially
  selective active noise control in open-fitting hearables. Simulations evaluate
  speech distortion, noise reduction, and SNR improvement across delays and
  degrees of acausality.
status: official
citation_key: xiao2025spatially
authors:
  - Tong Xiao
  - Simon Doclo
year: 2025
tags:
  - anc
  - spatially-selective-anc
  - hearables
  - acausal-optimization
key_references:
  - title: 'Spatially selective active noise control systems'
    doi: ''
    year: 2023
    role: foundation
    reason: Introduces the spatially selective ANC framework extended to open-fitting hearables.
    status: external
    linked_card: null
  - title: 'Effect of target signals and delays on spatially selective active noise control for open-fitting hearables'
    doi: ''
    year: 2024
    role: method
    reason: Establishes the causal target-signal and delay formulation used as the direct comparison.
    status: external
    linked_card: null
  - title: 'The hearpiece database of individual transfer functions of an in-the-ear earpiece for hearing device research'
    doi: ''
    year: 2021
    role: dataset
    reason: Provides measured hearpiece transfer functions used to construct the simulated acoustic paths.
    status: external
    linked_card: null
  - title: 'CSTR VCTK corpus: English multi-speaker corpus for CSTR voice cloning toolkit'
    doi: ''
    year: 2017
    role: dataset
    reason: Supplies speech material for the desired and interfering source simulations.
    status: external
    linked_card: null
  - title: 'Assessment for automatic speech recognition: II. NOISEX-92: A database and an experiment to study the effect of additive noise on speech recognition systems'
    doi: ''
    year: 1993
    role: dataset
    reason: Supplies standard noise material for evaluating speech preservation and noise reduction.
    status: external
    linked_card: null
  - title: 'Beamforming: a versatile approach to spatial filtering'
    doi: ''
    year: 1988
    role: foundation
    reason: Provides foundational spatial filtering concepts relevant to direction-selective control.
    status: external
    linked_card: null
drive: []
related: []
created: '2026-06-13'
reviewed_by: []
---
## Summary

This paper extends spatially selective active noise control for open-fitting hearables by allowing acausal relative impulse responses in the speech-preservation constraint. The extra anti-causal freedom improves the approximation of the desired source path, reducing speech distortion and increasing SNR while retaining useful noise attenuation. Simulations also show less sensitivity to the selected processing delay than the causal formulation.

## Problem

Open-fitting hearables should suppress unwanted directions without distorting desired speech that naturally leaks into the ear canal. A causal preservation filter may be unable to reproduce the desired acoustic relation for practical delays, forcing an unfavorable trade-off between noise reduction and speech distortion.

## Method

The inner-microphone signal combines direct acoustic leakage and anti-noise:

$$
e(n)
=
p(n)
+
(\mathbf G\mathbf w)^{\mathsf T}\mathbf x(n),
\qquad
p(n)=\mathbf q^{\mathsf T}\mathbf x(n).
$$

Here, $\mathbf x(n)$ stacks the reference signals, $\mathbf q$ describes their leakage path to the inner microphone, $\mathbf G$ contains the secondary-path convolution matrices, and $\mathbf w$ is the control filter.

The desired speech component should match a delayed reference signal. The paper represents this condition with a relative-impulse-response matrix $\mathbf H$ that contains $L_a$ anti-causal taps and $L_h$ causal taps. The controller solves

$$
\min_{\mathbf w}
\;
\mathbb E\!\left[e^2(n)\right]
+
\beta\,\mathbf w^{\mathsf T}\mathbf w
\quad
\text{subject to}
\quad
\mathbf H(\mathbf q+\mathbf G\mathbf w)
=
\boldsymbol{\delta}_{\Delta}.
$$

The regularization weight $\beta$ limits control effort, while $\boldsymbol{\delta}_{\Delta}$ represents the desired delayed response. Allowing $L_a>0$ gives the optimizer more freedom to approximate the target transfer relationship and reduces sensitivity to the selected delay $\Delta$.

The simulations use a KEMAR dummy head with open-fitting hearables, outer reference microphones, an inner error microphone, and one secondary loudspeaker. Speech distortion, noise reduction, and SNR improvement are evaluated across source arrangements, delays, regularization strengths, and degrees of acausality.

## Key results

The acausal formulation consistently reduces speech distortion and improves SNR compared with the causal controller. Reported SNR improvements exceed 17 dB in several tested configurations, whereas causal solutions remain much lower when high noise reduction is required. Increasing the anti-causal length improves speech preservation until performance stabilizes, while noise attenuation remains comparatively steady.

## Strengths

The paper isolates the effect of acausal relative impulse responses and evaluates the speech-preservation/noise-reduction trade-off with complementary metrics. Reduced delay sensitivity is especially relevant to practical system design.

## Limitations

The evidence is simulation-based and uses one hearable geometry and acoustic setup. Generalization to individual ear acoustics, changing device fits, transfer-function uncertainty, and real-time implementation remains to be established.

## Relevance to our group

The work provides a clear optimization framework for directional hear-through ANC. It is especially relevant to preserving warning sounds or speech while suppressing other directions, and it identifies acausality as a design resource rather than merely a non-realizable mathematical artifact.

## Notes

Verify the chosen delay, anti-causal length, and implementation latency before reusing the reported operating points in a real-time controller.
