---
title: Cognitive Virtual Sensing Technique for Feedforward Active Noise Control
entry_type: literature
publication_type: conference-paper
primary_domain: active-noise-control
domains:
  - active-noise-control
venue: ICASSP
doi: 10.1109/ICASSP48485.2024.10446463
abstract: >-
  The virtual sensing (VS) technique enables an active noise control (ANC)
  system to estimate the virtual error signal for control using remote
  monitoring microphones. However, in- stances where noise characteristics and
  primary paths exhibit variations lead to a noticeable decline in performance
  for the conventional VS technique. To address this challenge, we propose the
  cognitive VS technique in this paper. Its objective is to enhance VS
  performance by providing a more precise es- timate of the error signal based
  on environmental cognition. Differing from the previous selective VS
  technique, the cogni- tive VS technique connects both the reference and
  monitoring microphones to a lightweight classifier. Hence, the cognitive VS
  technique has the capability to dynamically adjust the VS filter in accordance
  with the noise and environmental condi- tions identified by the classifier.
  Simulation results demon- strate that the cognitive VS technique surpasses
  conventional and selective VS techniques in terms of adaptivity and gener-
  alisation when noise characteristics change and primary paths are
  time-varying.
status: official
citation_key: Xie2024Cognitive
authors:
  - Rong Xie
  - Anqi Tu
  - Chuang Shi
  - Stephen Elliott
  - Huiyong Li
  - Le Zhang
year: 2024
tags:
  - active-noise-control
  - virtual-sensing
  - adaptive-filtering
  - machine-learning
  - convolutional-neural-networks
key_references:
  - title: >-
      A hybrid SFANC-FxNLMS algorithm for active noise control based on deep
      learning
    doi: 10.1109/LSP.2022.3162311
    year: 2022
    role: foundation
    reason: >-
      This paper introduces a hybrid SFANC-FxNLMS algorithm using a lightweight
      M6-res network for noise classification, which is a precursor to the
      cognitive VS technique proposed here.
    status: external
    linked_card: null
  - title: >-
      Selective virtual sensing technique for multi-channel feedforward active
      noise control systems
    doi: 10.1109/ICASSP.2019.2400084
    year: 2019
    role: foundation
    reason: >-
      This work is cited as a previous selective VS technique that the proposed
      cognitive VS technique improves upon, particularly in handling primary
      path variations.
    status: external
    linked_card: null
  - title: Robust performance of virtual sensing methods for active noise control
    doi: 10.1016/j.ymssp.2020.107515
    year: 2021
    role: related_work
    reason: >-
      This paper discusses the robustness of virtual sensing methods, providing
      context for the challenges addressed by the cognitive VS technique.
    status: external
    linked_card: null
  - title: >-
      MobileNets: Efficient convolutional neural networks for mobile vision
      applications
    doi: 10.48550/arXiv.1704.04816
    year: 2017
    role: method
    reason: >-
      This paper introduces depthwise separable convolution, a key component
      adopted and modified for the lightweight classifier in the proposed
      cognitive VS technique.
    status: external
    linked_card: null
  - title: >-
      Feedforward selective fixed-filter active noise control: Algorithm and
      implementation
    doi: 10.1109/TASLP.2020.2987384
    year: 2020
    role: related_work
    reason: >-
      This paper details the selective fixed-filter active noise control (SFANC)
      system, which is a foundational concept that the cognitive VS technique
      builds upon and enhances.
    status: external
    linked_card: null
key_figure:
  status: cached
  figure_id: '1'
  page: 2
  role: method_overview
  caption: >-
    Block diagram of the cognitive VS technique, exemplified based on the AF
    method.
  reason: >-
    This figure provides a clear, high-level overview of how the cognitive VS
    technique integrates a classifier with the traditional AF method to
    dynamically adjust the control filter based on environmental cognition.
  image_ref: 1pmWS6nt6v6sb6yjFLo7tGA_41vk8ZHTW
  image_private: true
drive:
  - >-
    https://drive.google.com/file/d/1j1TTEUVYIuoMWStvS-IqD7CHdU0_XNYc/view?usp=drivesdk
related: []
created: '2026-06-15'
reviewed_by: []
rating: null
ratings: []
comments: []
uploaded_by: WBX
uploaded_at: '2026-06-15T12:48:01.551Z'
pdf_uploaded_by: WBX
pdf_uploaded_at: '2026-06-15T12:46:59.442Z'
pdf_file_name: 0005_Xie2024Cognitive.pdf
pdf_reused: false
activity:
  - action: pdf_uploaded
    by: WBX
    at: '2026-06-15T12:46:59.442Z'
    detail: 0005_Xie2024Cognitive.pdf
  - action: card_published
    by: WBX
    at: '2026-06-15T12:48:01.551Z'
  - action: key_figure_updated
    by: WBX
    at: '2026-06-15T13:10:54.600Z'
    detail: '1'
---
## Summary
This paper introduces a cognitive virtual sensing (VS) technique to improve the performance of active noise control (ANC) systems, particularly when noise characteristics or primary paths change over time. Unlike conventional VS methods that struggle with such variations, the proposed cognitive VS technique uses a lightweight classifier to analyze both reference and monitoring microphone signals. This allows the system to dynamically adapt its VS filter based on the identified noise and environmental conditions. Simulation results demonstrate that the cognitive VS technique offers superior adaptivity and generalization compared to existing methods, achieving more effective noise reduction under varying conditions.

## Problem
Conventional virtual sensing (VS) techniques in active noise control (ANC) systems rely on estimating the error signal at a desired control point using remote monitoring microphones. However, their performance degrades significantly when the characteristics of the noise source or the primary acoustic paths change. This limitation is problematic in real-world applications where environmental conditions are dynamic. Existing selective VS techniques, while robust to noise variations, do not adequately address changes in primary paths. The mandatory use of an error microphone at the control point is often impractical, necessitating effective VS methods that can operate reliably with remote monitoring microphones under varying conditions.

## Method
The proposed cognitive VS technique enhances the adaptive filter (AF) method for virtual sensing. In the training stage, the error microphone is used to capture the true error signal $E_v(\omega)$ and the monitoring microphone captures $E_m(\omega)$. The disturbance signal is $D_v(\omega)$ and $D_m(\omega)$ respectively, the secondary path is $S_v(\omega)$ and $S_m(\omega)$, the control filter is $W(\omega)$, and the reference signal is $X(\omega)$. The relationship is given by:

$E_v(\omega) = D_v(\omega) + S_v(\omega) W(\omega) X(\omega)$  (1)

The unconstrained optimal control filter $W_{opt}(\omega)$ is derived as:

$W_{opt}(\omega) = -S_v^{-1}(\omega) D_v(\omega) X^{-1}(\omega)$  (2)

The additional filter (AF) $H(\omega)$ is then obtained to predict the monitoring microphone's output based on the reference signal and the optimal control filter:

$H(\omega) = -E_m(\omega) X^{-1}(\omega) = -D_m(\omega) X^{-1}(\omega) - S_m(\omega) W_{opt}(\omega)$  (3)

In the control stage, the error microphone is removed. The control filter $\tilde{W}(\omega)$ is updated to minimize the difference between the monitoring microphone's output and the AF's prediction, considering potential changes in the environment ($\tilde{D}_m(\omega)$, $\tilde{X}(\omega)$):

$\tilde{W}(\omega) = -S_m^{-1}(\omega) [\tilde{D}_m(\omega) \tilde{X}^{-1}(\omega) + H(\omega)]$  (4)

The cognitive VS technique introduces a lightweight classifier, an improved MB6-res network, which takes both the reference signal $x(n)$ and the estimated disturbance signal $d_m(n)$ as inputs. This classifier identifies both the noise class and the primary source condition. Based on the classifier's output $(p, q)$, a pre-trained AF $H_{p,q}$ from a database is selected and dynamically adjusted. This approach allows the system to adapt to variations in both noise characteristics and primary paths. The MB6-res network utilizes depthwise separable convolution for efficiency and sigmoid pooling for classification accuracy.

## Key results
Simulations demonstrated that the cognitive VS technique significantly outperforms conventional AF and selective AF methods. Under conditions with changing noise characteristics and time-varying primary paths, the cognitive AF method showed optimized performance and faster convergence than a baseline FxLMS system. Its generalization ability was evident in scenarios where the primary path was non-static, providing higher noise attenuation. When primary paths were subjected to random perturbations, the cognitive AF method approached the baseline performance as the signal-to-noise ratio (SNR) increased. The MB6-res network, used in the cognitive VS technique, was found to be 3.8 times lighter, 2.3 times faster, and achieved 0.18% higher accuracy than the M6-res network used in previous SFANC systems.

## Strengths
The cognitive VS technique offers enhanced adaptivity and generalization capabilities for ANC systems operating under dynamic noise and primary path conditions. The use of a lightweight MB6-res classifier, incorporating depthwise separable convolutions, leads to a more efficient and faster system compared to previous deep learning-based approaches. The ability to dynamically adjust the AF based on identified environmental conditions (noise class and source condition) is a significant improvement over static or less adaptive VS methods.

## Limitations
The performance of the cognitive AF method can degrade when the panning factor of the primary source is bounded by a larger interval, indicating a limit to its generalization under extreme variations. In scenarios with low SNR (e.g., 5 dB), the accuracy of source condition classification decreases, leading to overlapping performance with selective AF methods, particularly for fan noise. The baseline system (FxLMS with an error microphone at the virtual location) still provided the best performance in some tested scenarios, suggesting that perfect VS is challenging.

## Relevance to our group
This work is highly relevant to our group's research in active noise control and signal processing. The proposed cognitive VS technique addresses a critical limitation in current ANC systems: their sensitivity to environmental variations. Developing robust and adaptive VS methods is crucial for deploying effective ANC solutions in real-world applications, such as automotive cabins, aircraft, or personal audio devices. The use of lightweight deep learning models for environmental cognition aligns with our interest in efficient and deployable signal processing algorithms. The methodology and simulation results provide valuable insights into improving the performance and robustness of ANC systems.

## Notes
The paper was presented at ICASSP 2024. The authors propose a novel MB6-res network, an improvement over the M6-res network, by incorporating depthwise separable convolution and sigmoid pooling. This network is used to classify both noise class and primary source condition, enabling dynamic adjustment of the additional filter (AF) in a virtual sensing framework for ANC.
