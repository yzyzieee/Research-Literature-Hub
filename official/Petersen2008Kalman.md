---
title: A Kalman filter approach to virtual sensing for active noise control
entry_type: literature
publication_type: journal-paper
primary_domain: active-noise-control
domains:
  - active-noise-control
  - machine-learning-audio
  - fundamentals-dsp
venue: Mechanical Systems and Signal Processing
doi: 10.1016/j.ymssp.2007.06.007
abstract: >-
  Local active noise control systems aim to produce zones of quiet at a number
  of desired locations within a sound field, such as the ears of an observer.
  The resulting zones of quiet are usually centred at the error sensors, and are
  often too small to extend from the error sensors to the observer’s ears. To
  overcome these problems, virtual sensing methods have been suggested. These
  methods are based on estimating the error signals at a number of locations
  remote from the physical locations of the error sensors. By minimising the
  estimated error signals, the zones of quiet can be moved away from the error
  sensors to the locations where noise control is desired, i.e. the virtual
  locations. In this paper, the active noise control problem under consideration
  is analysed using a state-space model of the plant. Kalman filtering theory is
  then used to develop a virtual sensing algorithm that computes optimal
  estimates of the error signals at the virtual locations. The developed
  algorithm is implemented on an acoustic duct arrangement, and the real-time
  estimation performance at a virtual location inside the acoustic duct is
  analysed. Furthermore, the developed algorithm is combined with the filtered-x
  LMS, and the results of real-time broadband feedforward control experiments at
  the virtual location are presented.
status: official
citation_key: Petersen2008Kalman
authors:
  - Cornelis D. Petersen
  - Rufus Fraanje
  - Ben S. Cazzolato
  - Anthony C. Zander
  - Colin H. Hansen
year: 2008
tags:
  - kalman-filtering
  - state-space-model
  - virtual-sensing
  - active-noise-control
  - filtered-x-lms
  - real-time-implementation
key_references:
  - title: Virtual microphone arrangement for active noise control
    doi: 10.1109/ICASSP.1999.754004
    year: 1999
    role: foundation
    reason: >-
      Introduces the 'virtual microphone arrangement' concept, a foundational
      virtual sensing method.
    status: external
    linked_card: null
  - title: Active noise control using remote microphone technique
    doi: 10.1109/ISCAS.2003.1207407
    year: 2003
    role: foundation
    reason: >-
      Presents the 'remote microphone technique', another early virtual sensing
      approach.
    status: external
    linked_card: null
  - title: Adaptive LMS virtual microphone technique for active noise control
    doi: 10.1109/ISCAS.2004.1325558
    year: 2004
    role: foundation
    reason: >-
      Describes the 'adaptive LMS virtual microphone technique', an alternative
      to filter-based methods.
    status: external
    linked_card: null
  - title: State-space methods for control
    doi: 10.1007/978-1-4615-6311-6
    year: 1991
    role: foundation
    reason: >-
      Provides the theoretical basis for state-space modeling and Kalman
      filtering used in the paper.
    status: external
    linked_card: null
  - title: An introduction to the Kalman filter
    doi: 10.1109/7.102263
    year: 1993
    role: foundation
    reason: >-
      A foundational reference for Kalman filter theory, underpinning the
      paper's approach.
    status: external
    linked_card: null
  - title: 'Active noise control systems: techniques and applications'
    doi: 10.1017/CBO9780511535795
    year: 2007
    role: foundation
    reason: >-
      A comprehensive text on active noise control, providing context for the
      problem addressed.
    status: external
    linked_card: null
  - title: 'Subspace identification for linear systems: a survey'
    doi: 10.1016/S0005-1098(99)00004-1
    year: 1999
    role: method
    reason: Details subspace model identification techniques used for plant modeling.
    status: external
    linked_card: null
  - title: Adaptive filter theory
    doi: 10.1017/CBO9780511779417
    year: 2002
    role: method
    reason: >-
      Provides the theoretical background for the Filtered-x LMS algorithm used
      in control experiments.
    status: external
    linked_card: null
key_figure:
  status: cached
  figure_id: Fig. 1
  page: 8
  role: system_setup
  caption: Block diagram of the active noise control problem.
  reason: >-
    This figure provides a high-level overview of the system architecture,
    illustrating the roles of the plant, virtual sensing algorithm, and adaptive
    controller, which is crucial for understanding the paper's approach.
  image_ref: 1B5eLpllTOtfh274wj1DUmexqmgU_OqRk
  image_private: true
drive:
  - >-
    https://drive.google.com/file/d/1wpxL9NUxHoKCmv3FHYYSsPI1vYCihuZH/view?usp=drivesdk
related: []
created: '2026-06-16'
reviewed_by: []
rating: null
ratings: []
comments: []
uploaded_by: LXX
uploaded_at: '2026-06-16T16:00:54.566Z'
pdf_uploaded_by: LXX
pdf_uploaded_at: '2026-06-16T16:00:03.741Z'
pdf_file_name: 0018_Petersen2008Kalman.pdf
pdf_reused: false
activity:
  - action: pdf_uploaded
    by: LXX
    at: '2026-06-16T16:00:03.741Z'
    detail: 0018_Petersen2008Kalman.pdf
  - action: card_published
    by: LXX
    at: '2026-06-16T16:00:54.566Z'
---
## Summary
This paper presents a novel virtual sensing algorithm for active noise control (ANC) systems, leveraging Kalman filtering theory to estimate error signals at desired virtual locations remote from physical sensors. The approach models the ANC system using a state-space representation, allowing for optimal estimation of virtual error signals even in the presence of measurement noise. The algorithm was implemented and validated on an acoustic duct, demonstrating accurate real-time estimation and effective broadband feedforward control at the virtual location. The results show significant noise attenuation at the virtual location, outperforming traditional methods that focus on physical sensor locations.

## Problem
Local active noise control systems typically create zones of quiet centered around physical error sensors. However, these zones are often too small to cover the desired listening areas, such as an observer's ears. Existing virtual sensing methods attempt to overcome this by estimating error signals at remote, desired locations. The challenge lies in accurately estimating these virtual error signals, especially when the sound field varies significantly between physical and virtual sensor locations, and when measurement noise is present. Conventional methods often rely on simplifying assumptions (e.g., identical disturbances at physical and virtual sensors) or require extensive filter matrices, which can limit their accuracy and generality.

## Method
The paper models the active noise control system using a state-space representation:
$$ z(n+1) = Az(n) + B_u u(n) + B_s s(n) $$ 
$$ e_p(n) = C_p z(n) + D_{pu} u(n) + D_{ps} s(n) + v_p(n) $$ 
$$ e_v(n) = C_v z(n) + D_{vu} u(n) + D_{vs} s(n) + v_v(n) $$ 
where $z(n)$ are the plant states, $s(n)$ are disturbance signals, $u(n)$ are control signals, $e_p(n)$ are physical error signals, $e_v(n)$ are virtual error signals (not directly measured), and $v_p(n), v_v(n)$ are measurement noise signals. The core of the method involves applying Kalman filtering theory to estimate the virtual error signals $e_v(n)$ using the directly measured physical error signals $e_p(n)$.

Initially, a Kalman filter is formulated assuming physical sensors are temporarily placed at virtual locations to measure both physical and virtual error signals for system identification. This allows for the estimation of state-space matrices and the Kalman gain $K_s$. Subsequently, the virtual sensing algorithm is derived by assuming the virtual sensors are removed. This algorithm computes optimal estimates $\hat{e}_v(n|n)$ of the virtual error signals using the physical error signals $e_p(n)$ and the control signals $u(n)$. The algorithm is described by a compact state-space model:
$$ \hat{z}(n|n) = A \hat{z}(n|n-1) + K_{ps} e_p(n) + M_{vs} e_p(n) $$ 
$$ \hat{e}_v(n|n) = C_v \hat{z}(n|n) + D_{vu} u(n) $$ 
where $K_{ps}$ and $M_{vs}$ are derived Kalman and virtual gain matrices, respectively, computed from the plant's state-space realization and noise covariance matrices. The virtual sensing algorithm is then integrated with the filtered-x LMS algorithm for real-time feedforward control, where the estimated virtual error signal $\hat{e}_v(n|n)$ is used to update the controller weights $w(n)$.

## Key results
Experimental results on an acoustic duct demonstrated the effectiveness of the proposed virtual sensing algorithm. The real-time estimation performance showed an accurate estimate of the virtual primary disturbance, achieving a 24.6 dB reduction in the virtual output error compared to the measured virtual primary disturbance.

In terms of active noise control, when minimizing the estimated virtual error signal $\hat{e}_v(n|n)$, an overall broadband attenuation of 19.7 dB was achieved at the virtual location. This is compared to an attenuation of 25.1 dB when minimizing the true virtual error signal $e_v(n)$ directly measured at the virtual location, a difference of 5.4 dB. Crucially, minimizing the physical error signal $e_p(n)$ resulted in only 1.4 dB amplification at the virtual location, whereas minimizing the estimated virtual error signal $\hat{e}_v(n|n)$ provided the significant 19.7 dB attenuation. This highlights the substantial benefit of using virtual sensing to achieve noise control at desired locations away from physical sensors.

## Strengths
The proposed Kalman filter-based virtual sensing approach offers several advantages: it provides optimal estimates of virtual error signals in a least mean-square sense, it explicitly accounts for measurement noise, and it does not require the assumption of identical disturbances at physical and virtual sensors. The state-space formulation is general and applicable to MIMO systems. The integration with the filtered-x LMS algorithm enables effective real-time feedforward control at virtual locations. The experimental validation on an acoustic duct confirms its practical applicability and performance.

## Limitations
The accuracy of the virtual sensing algorithm is dependent on the accuracy of the estimated state-space model of the plant. Errors in the model, particularly in the transfer path estimates, can degrade performance. The paper notes that a perfect estimation of the virtual primary disturbance is limited by the causality of the relationship between physical and virtual disturbances, and by the accuracy of the virtual secondary transfer path model used in the filtered-x LMS algorithm. The performance difference between minimizing the estimated and true virtual error signals (5.4 dB) is attributed to these factors.

## Relevance to our group
This paper is highly relevant to our group's research in active noise control and related signal processing techniques. The application of Kalman filtering for virtual sensing addresses a key challenge in ANC: extending the zone of quiet to desired locations. The use of state-space models and subspace identification techniques aligns with our interest in robust system modeling. The real-time implementation and experimental validation provide valuable insights into practical ANC system design. The comparison between minimizing physical and virtual error signals directly informs strategies for optimizing ANC performance in complex acoustic environments.

## Notes
The paper uses a two-step identification procedure for the plant model: first identifying the deterministic part and then the stochastic part. This approach is noted to generally result in a more accurate model. The authors acknowledge that the virtual sensing algorithm is not able to provide an estimate of unobservable parts of the virtual primary disturbances, which are related to the physical and virtual sensor configuration. The paper provides detailed mathematical derivations in appendices, including a minimal state-space realization of the optimal filter $H_o$.
