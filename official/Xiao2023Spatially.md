---
title: Spatially selective active noise control systems
entry_type: literature
publication_type: journal-paper
primary_domain: active-noise-control
domains:
  - active-noise-control
  - beamforming-arrays
venue: J. Acoust. Soc. Am.
doi: 10.1121/10.0019336
abstract: >-
  Active noise control (ANC) systems are commonly designed to achieve maximal
  sound reduction regardless of the incident direction of the sound. When
  desired sound is present, the state-of-the-art methods add a separate system
  to reconstruct it. This can result in distortion and latency. In this work, we
  propose a multi-channel ANC system that only reduces sound from undesired
  directions, and the system truly preserves the desired sound instead of
  reproducing it. The proposed algorithm imposes a spatial constraint on the
  hybrid ANC cost function to achieve spatial selectivity. Based on a
  six-channel microphone array on a pair of augmented eyeglasses, results show
  that the system minimized only noise coming from undesired directions. The
  control performance could be maintained even when the array was heavily
  perturbed. The proposed algorithm was also compared with the existing methods
  in the literature. Not only did the proposed system provide better noise
  reduction, but it also required much less effort. The binaural localization
  cues did not need to be reconstructed since the system preserved the physical
  sound wave from the desired source.
status: official
citation_key: Xiao2023Spatially
authors:
  - Tong Xiao
  - Buye Xu
  - Chuming Zhao
year: 2023
tags:
  - spatial-audio
  - microphone-array
  - adaptive-filtering
  - frost-algorithm
  - hybrid-anc
key_references:
  - title: >-
      Combined feedforward-feedback noise reduction schemes for open-fitting
      hearing aids
    doi: 10.1121/1.3657476
    year: 2011
    role: related_work
    reason: >-
      This paper explores combined feedforward-feedback noise reduction for
      hearing aids, which is a precursor to hybrid ANC systems.
    status: external
    linked_card: null
  - title: An algorithm for linearly constrained adaptive array processing
    doi: 10.1109/PROC.1972.8780
    year: 1972
    role: foundation
    reason: >-
      This foundational work introduces the Frost algorithm, which is central to
      the spatial constraint used in the proposed method.
    status: external
    linked_card: null
  - title: >-
      Design and implementation of an active noise control headphone with
      directional hear-through capability
    doi: 10.1109/TCE.2019.2953712
    year: 2020
    role: related_work
    reason: >-
      This paper presents a related approach for ANC headphones with directional
      hear-through, offering a point of comparison.
    status: external
    linked_card: null
  - title: Integrated active noise control and noise reduction in hearing aids
    doi: 10.1109/TASL.2010.2053743
    year: 2010
    role: related_work
    reason: >-
      This work integrates ANC and noise reduction in hearing aids, touching
      upon similar concepts of selective noise control.
    status: external
    linked_card: null
  - title: Adaptive Filter Theory
    doi: ''
    year: 2002
    role: foundation
    reason: >-
      This is a standard textbook on adaptive filters, providing theoretical
      background for the adaptive algorithms used.
    status: external
    linked_card: null
key_figure:
  status: cached
  figure_id: Figure 2
  page: 2736
  role: main_result
  caption: null
  reason: null
  image_ref: 1hCX-fkwguZjPM73yAGOGIDqkgkcDpX9h
  image_private: true
drive:
  - >-
    https://drive.google.com/file/d/1QmOoUc8lJth71WKRnXWto0pKuQRwGs1U/view?usp=drivesdk
related: []
created: '2026-06-15'
reviewed_by: []
rating: null
ratings: []
comments: []
uploaded_by: YZY
uploaded_at: '2026-06-15T13:00:20.709Z'
pdf_uploaded_by: YZY
pdf_uploaded_at: '2026-06-15T12:59:32.702Z'
pdf_file_name: 0007_Xiao2023Spatially.pdf
pdf_reused: false
activity:
  - action: pdf_uploaded
    by: YZY
    at: '2026-06-15T12:59:32.702Z'
    detail: 0007_Xiao2023Spatially.pdf
  - action: card_published
    by: YZY
    at: '2026-06-15T13:00:20.709Z'
---
## Summary
This paper introduces a novel multi-channel active noise control (ANC) system designed for spatial selectivity. Unlike traditional ANC systems that aim to minimize all sound, this proposed system selectively reduces noise from undesired directions while preserving desired sound sources. The core innovation lies in imposing a spatial constraint, derived from the Frost algorithm, onto the cost function of a hybrid ANC system. This approach avoids the need to reconstruct the desired sound, thereby mitigating distortion and latency. Experiments conducted on a six-channel microphone array integrated into augmented reality glasses demonstrate the system's effectiveness in minimizing noise from specific directions and its robustness to array perturbations. Comparisons with existing methods show superior noise reduction with significantly less computational effort and without compromising the natural binaural localization cues of the desired sound.

## Problem
Conventional active noise control (ANC) systems are designed to attenuate all incoming sound, regardless of its direction. While effective for broad noise reduction, this approach is problematic when desired sounds, such as speech or music, are present. Existing methods to handle desired sound often involve a separate system to reconstruct and reproduce it, which can introduce undesirable distortion, latency, and alter binaural localization cues. This leads to a fundamental challenge: how to achieve effective noise reduction from specific directions without negatively impacting desired sound signals.

## Method
The proposed system builds upon a hybrid ANC architecture, integrating a spatial constraint to achieve selectivity. The disturbance signal $d(n)$ at the error microphone is modeled as the sum of a desired signal $s(n)$ and a noise signal $v(n)$: $d(n) = s(n) + v(n)$. The error signal $e(n)$ in the hybrid ANC system is given by $e(n) = d(n) + w^T G^T x(n)$, where $w$ is the control filter, $G$ represents the secondary path impulse responses, and $x(n)$ is the input vector. The key innovation is the introduction of a spatial constraint based on the Frost algorithm: $H^T u = f$. Here, $H$ contains the relative impulse responses of the microphone array, and $f$ is a constraint vector defining the desired signal's frequency response from a specific direction. This constraint ensures that the desired signal component $s(n)$ is preserved in the error signal, i.e., $e_s(n) = s(n)$, rather than being canceled and reconstructed. The cost function is formulated as minimizing the expected squared error $E[e(n)^2]$ subject to the spatial constraint. Both optimal and adaptive solutions for the control filter $w$ are derived. The adaptive solution, illustrated in Figure 2, uses a coupled adaptive algorithm that incorporates the spatial constraint, leading to matrices $P$ and $q$. Spectral weighting can be applied to further enhance performance, and regularization factors ($q$, $c$, $b$) are introduced to ensure numerical robustness against signal mismatches and system instabilities.

## Key results
The proposed spatially selective ANC system demonstrated significant noise reduction (NR) while maintaining a low speech distortion index (SDI). In simulations using a six-channel microphone array on AR glasses, the system improved the signal-to-noise ratio (SNR) from -13.9 dB to 15.2 dB, with an SDI of -25.1 dB, indicating minimal distortion to the desired speech. The system proved robust even under severe sensor noise conditions (30 dB higher than the desired signal), achieving 24.3 dB NR and -22.5 dB SDI by appropriately selecting regularization factors based on eigenvalues. Comparisons with existing methods showed that the proposed system required significantly less control effort (e.g., 2% secondary source energy vs. much higher for others) while achieving better or comparable noise reduction. Crucially, the desired sound was preserved, maintaining natural binaural localization cues without reconstruction, unlike other methods that suffered from latency and distortion.

## Strengths
The primary strength of this work is the development of a spatially selective ANC system that genuinely preserves desired sound signals rather than reconstructing them. This approach effectively eliminates distortion, latency, and preservation of binaural cues associated with reconstruction methods. The system demonstrates robust performance even under challenging conditions, such as significant sensor noise, by employing appropriate regularization techniques. The use of a hybrid ANC framework combined with spatial constraints allows for efficient control of noise from undesired directions while leaving desired signals untouched. The reduced control effort is another significant advantage, making it suitable for power-constrained devices.

## Limitations
The directivity performance of the system is inherently limited by the causality of the ANC subsystem and the microphone array configuration. In situations where noise reaches the error microphone before the reference microphones, causality is violated, reducing effectiveness. The paper also notes that the performance can be affected by the secondary path characteristics, particularly delays, and the transducer limitations in miniaturized speakers. Future work is suggested to address acoustic feedback and performance in reverberant environments, which were not fully explored in this study.

## Relevance to our group
This research is highly relevant to our group's interests in advanced audio signal processing, particularly in areas like speech enhancement, source separation, and spatial audio. The proposed method offers a sophisticated approach to selectively attenuate noise in complex acoustic environments, which is a core challenge in many of our research endeavors. The focus on preserving desired sound signals and natural spatial cues aligns with our goals for creating more immersive and intelligible audio experiences. The robustness and efficiency demonstrated by the system are also valuable considerations for practical applications.

## Notes
The authors utilized a six-channel microphone array on augmented reality glasses for their experiments. The system was evaluated using both simulated data and real-world audio signals, including speech and babble noise. The paper provides detailed derivations for both optimal and adaptive solutions, as well as a thorough comparison with existing state-of-the-art methods. The use of the Frost algorithm for spatial constraint is a key methodological contribution. Future research directions include handling multiple desired sources, scenarios where desired and noise sources originate from the same direction (potentially using blind source separation), and addressing acoustic feedback in real-world deployments.
