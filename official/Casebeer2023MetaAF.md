---
title: 'Meta-AF: Meta-Learning for Adaptive Filters'
entry_type: literature
publication_type: journal-paper
primary_domain: machine-learning-audio
domains:
  - machine-learning-audio
  - active-noise-control
  - acoustic-echo-cancellation
  - speech-enhancement
  - beamforming-arrays
  - fundamentals-dsp
venue: 'IEEE/ACM Transactions on Audio, Speech, and Language Processing'
doi: 10.1109/TASLP.2022.3224288
abstract: >-
  Adaptive filtering algorithms are pervasive throughout signal processing and
  have had a material impact on a wide variety of domains including audio
  processing, telecommunications, biomedical sensing, astrophysics and
  cosmology, seismology, and many more. Adaptive filters typically operate via
  specialized online, iterative optimization methods such as least-mean squares
  or recursive least squares and aim to process signals in unknown or
  nonstationary environments. Such algorithms, however, can be slow and
  laborious to develop, require domain expertise to create, and necessitate
  mathematical insight for improvement. In this work, we seek to improve upon
  hand-derived adaptive filter algorithms and present a comprehensive framework
  for learning online, adaptive signal processing algorithms or update rules
  directly from data. To do so, we frame the development of adaptive filters as
  a meta-learning problem in the context of deep learning and use a form of
  self-supervision to learn online iterative update rules for adaptive filters.
  To demonstrate our approach, we focus on audio applications and systematically
  develop meta-learned adaptive filters for five canonical audio problems
  including system identification, acoustic echo cancellation, blind
  equalization, multi-channel dereverberation, and beamforming. We compare our
  approach against common baselines and/or recent state-of-the-art methods. We
  show we can learn high-performing adaptive filters that operate in real-time
  and, in most cases, significantly outperform each method we compare against –
  all using a single general-purpose configuration of our approach.
status: official
citation_key: Casebeer2023MetaAF
authors:
  - Jonah Casebeer
  - Nicholas J. Bryan
  - Paris Smaragdis
year: 2023
tags:
  - adaptive-filters
  - meta-learning
  - online-optimization
  - deep-learning
  - learned-optimizers
key_references:
  - title: 'Recursive least squares: Adaptive filtering algorithms'
    doi: ''
    year: 1987
    role: foundation
    reason: >-
      This foundational work describes the Recursive Least Squares (RLS)
      algorithm, a key baseline and inspiration for adaptive filter optimizers.
    status: external
    linked_card: null
  - title: 'Least mean squares: Adaptive filtering algorithms'
    doi: ''
    year: 1987
    role: foundation
    reason: >-
      This foundational work describes the Least Mean Squares (LMS) algorithm, a
      fundamental adaptive filter optimizer and baseline.
    status: external
    linked_card: null
  - title: Deep learning for acoustic echo cancellation
    doi: 10.1109/TASLP.2020.3031923
    year: 2020
    role: related_work
    reason: >-
      This paper represents prior work in using deep learning for acoustic echo
      cancellation, a task addressed by the proposed Meta-AF.
    status: external
    linked_card: null
  - title: Learning to learn by gradient descent by gradient descent
    doi: 10.15614/15614
    year: 2017
    role: foundation
    reason: >-
      This paper introduced the concept of learning optimizers using
      meta-learning, which is a core inspiration for the Meta-AF framework.
    status: external
    linked_card: null
  - title: 'NARA-WPE: A novel algorithm for weighted prediction error dereverberation'
    doi: 10.1109/ICASSP.2019.8683344
    year: 2019
    role: baseline
    reason: >-
      This paper presents NARA-WPE, a strong baseline for dereverberation that
      the proposed Meta-AF is compared against.
    status: external
    linked_card: null
  - title: WebRTC noise suppression and echo cancellation
    doi: 10.1109/ICASSP.2021.9452806
    year: 2021
    role: baseline
    reason: >-
      This paper describes WebRTC-AEC3, a state-of-the-art acoustic echo
      cancellation system used as a baseline for comparison.
    status: external
    linked_card: null
key_figure:
  status: cached
  figure_id: Fig. 1
  page: 6
  role: method_overview
  caption: >-
    System identification block diagram. System inputs are fed to both the
    adaptive filter and the true system (shaded box). The adaptive filter is
    updated to mimic the true system.
  reason: >-
    Provides a good overview of the system identification problem and the role
    of the adaptive filter.
  image_ref: 17g5yYdpNiaRstpVazxBA8xubFpvtTUQd
  image_private: true
drive:
  - >-
    https://drive.google.com/file/d/1BcF23NZD0pLD-ZNvWsfiMhYTMU5F1SHC/view?usp=drivesdk
related: []
created: '2026-06-16'
reviewed_by: []
rating: null
ratings: []
comments: []
uploaded_by: YZY
uploaded_at: '2026-06-16T14:37:37.224Z'
pdf_uploaded_by: YZY
pdf_uploaded_at: '2026-06-16T13:50:41.805Z'
pdf_file_name: 0016_Casebeer2023MetaAF.pdf
pdf_reused: true
activity:
  - action: pdf_reused
    by: YZY
    at: '2026-06-16T13:50:41.805Z'
    detail: 0016_Casebeer2023MetaAF.pdf
  - action: card_published
    by: YZY
    at: '2026-06-16T14:37:37.224Z'
---
## Summary
This paper introduces Meta-AF, a novel framework that frames the development of adaptive filters (AFs) as a meta-learning problem. Instead of relying on hand-derived update rules, Meta-AF learns these rules directly from data using self-supervision and deep learning. The approach is demonstrated across five canonical audio processing tasks: system identification, acoustic echo cancellation (AEC), blind equalization, multi-channel dereverberation, and beamforming. Meta-AF consistently achieves real-time performance and, in most cases, significantly outperforms conventional baselines and state-of-the-art methods, even with a single, general-purpose configuration.

## Problem
Traditional adaptive filtering algorithms, while fundamental to many signal processing applications, are often slow to develop, require significant domain expertise, and necessitate intricate mathematical insight for optimization and improvement. Existing methods, such as LMS, NLMS, and RLS, can be sensitive to nonstationarities, nonlinearities, and require extensive hyperparameter tuning. Furthermore, the development of new AF algorithms has seen little change in decades, often relying on hybrid approaches that combine neural networks with traditional AFs rather than learning the AF update rules themselves. This work aims to overcome these limitations by learning adaptive filter update rules directly from data.

## Method
Meta-AF formulates adaptive filter design as a meta-learning problem, where a neural network, termed a learned optimizer $g_{\varphi}(\cdot)$, is trained to generate additive updates $\Delta [\tau]$ for filter parameters $\theta [\tau]$: $\theta [\tau+1] = \theta [\tau] + \Delta [\tau]$. The learned optimizer $g_{\varphi}$ is trained to minimize a meta-loss $L_M$, which is a function of the adaptive filter's performance on a given task, typically measured by an adaptive filter loss $L$. The filter architecture $h_{\theta}(\cdot)$ can be any differentiable filtering operator, and the loss $L$ can be any differentiable loss function. For this work, the authors focus on linear frequency-domain adaptive filters (FDAFs) with parameters $\theta_k [\tau] = \{w_k [\tau] \in \mathbb{C}^{BM}\}$ and use an instantaneous square error (ISE) loss. The learned optimizer $g_{\varphi}$ is implemented as a complex-valued recurrent neural network (RNN), specifically using Gated Recurrent Units (GRUs), which allows it to maintain internal state $\psi_k [\tau]$ and process multiple input signals $\xi_k [\tau] = [\nabla_k [\tau], u_k [\tau], d_k [\tau], y_k [\tau], e_k [\tau]]$. Here, $\nabla_k [\tau]$ is the gradient of the optimizee loss with respect to the filter parameters, $u_k [\tau]$ is the input signal, $d_k [\tau]$ is the desired signal, $y_k [\tau]$ is the estimated signal, and $e_k [\tau]$ is the error signal. The optimizer outputs the update $\Delta_k [\tau]$ and the next state $\psi_k [\tau+1]$. Two meta-losses are explored: a frame-independent loss and a frame-accumulated loss, with the latter proving more effective for learning STFT-consistent updates. Training is performed using truncated backpropagation through time (TBPTT) and the Adam optimizer, with a focus on self-supervision (no labeled data required for the AF task itself). The learned optimizer's weights $\varphi$ are shared across all frequency bins, while state $\psi_k$ is maintained per frequency.

## Key results
Meta-AF demonstrated strong performance across five audio tasks:

*   **System Identification:** Achieved high segmental SNR (≈40 dB) and showed robustness to modeling errors, generalizing to filter orders not seen during training.
*   **Acoustic Echo Cancellation (AEC):** Outperformed conventional methods (LMS, NLMS, RLS, D-KF, Speex) in single-talk, double-talk, and challenging scenarios with path changes, noise, and nonlinearities. It converged faster and maintained better speech quality (STOI).
*   **Equalization:** Achieved superior SNR$_d$ and SNR$_w$ compared to LMS, RMSProp, NLMS, and D-RLS, showing better robustness to constraints and faster convergence without divergence.
*   **Dereverberation:** Showed excellent performance in terms of Speech-to-Reverberation Ratio (SRR), outperforming multi-channel NARA-WPE even with fewer channels. However, perceptual quality (STOI) was lower, suggesting the need for perceptual alignment in the loss function.
*   **Beamforming:** (Details are cut off in the provided text, but the paper states it was applied to this task).

Across all tasks, Meta-AF achieved real-time performance and required minimal hyperparameter tuning for the learned optimizer, while conventional baselines needed extensive tuning per task.

## Strengths
*   **Automated AF Design:** Eliminates the need for manual derivation of adaptive filter update rules, reducing development time and expertise requirements.
*   **Data-Driven Learning:** Learns directly from data using self-supervision, avoiding the need for labeled datasets for the AF task.
*   **Generalizability:** A single Meta-AF configuration, trained on different datasets, can be applied to diverse audio tasks, demonstrating broad applicability.
*   **State-of-the-Art Performance:** Outperforms conventional and recent state-of-the-art methods across multiple challenging audio processing tasks.
*   **Real-Time Operation:** Achieves real-time performance on commodity hardware.
*   **Robustness:** Shows resilience to modeling errors and challenging acoustic conditions like double-talk, path changes, and nonlinearities.

## Limitations
*   **Dereverberation STOI:** While achieving high SRR, the perceptual quality (STOI) in dereverberation was lower than some baselines, indicating that the instantaneous loss function may not perfectly align with perceptual objectives. Further research into perceptual loss alignment is suggested.
*   **Training Time:** Training the meta-learner can be computationally intensive, although inference is real-time.
*   **Complexity of Learned Optimizer:** While effective, the learned optimizer (RNN) has a significant number of parameters (≈14K-17K complex-valued) compared to simpler AF algorithms.

## Relevance to our group
This work is highly relevant to our group as it presents a powerful, generalizable framework for learning adaptive signal processing algorithms. The ability to automatically learn optimal update rules for tasks like acoustic echo cancellation, dereverberation, and beamforming directly from data aligns perfectly with our research interests in advanced audio signal processing. The meta-learning approach offers a promising direction for developing more robust and efficient audio processing systems, potentially reducing the manual engineering effort typically required. The demonstrated success in various audio domains suggests Meta-AF could be adapted or extended to other related problems within our scope.

## Notes
The authors release demos and open-source code for their Meta-AF framework, which is valuable for reproducibility and further research. The paper systematically explores design choices for the learned optimizer, including loss functions and input features, providing insights into effective meta-learning strategies for adaptive filters. The comparison against a wide range of established baselines across multiple tasks strengthens the validation of their approach.
