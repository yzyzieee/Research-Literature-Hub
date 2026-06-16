---
title: Deep learning-assisted active noise control in a time-varying environment
entry_type: literature
publication_type: journal-paper
primary_domain: active-noise-control
domains:
  - active-noise-control
  - machine-learning-audio
venue: Journal of Mechanical Science and Technology
doi: 10.1007/s12206-023-0206-2
abstract: >-
  The success of active noise control (ANC) is largely determined by the
  fidelity of the estimated secondary path, which encapsulates the "room
  acoustics" between the secondary sound source and the error sensor. In a
  time-invariant system the secondary path is usually measured and hard-coded in
  the controller prior to the ANC operation. When ANC is to be performed in a
  time-varying environment, however, the estimated secondary path should be
  updated accordingly, a task that poses many challenges in terms of efficacy,
  cost, and user comfort. In this paper we present a deep learning-assisted
  secondary path update technique, in which deep neural networks are trained to
  estimate the secondary path in real time according to changing boundary
  conditions. The feasibility of the technique is tested in an airborne duct,
  where the error sensor is allowed to move along the duct to simulate changes
  in boundary conditions. Results have shown that even in the face of a dramatic
  change in boundary conditions, the ANC system equipped with the present update
  scheme is capable of reducing broadband noise by up to 10 dB.
status: official
citation_key: Im2023Deep
authors:
  - Seonghun Im
  - Siwon Kim
  - Sunghwa Woo
  - Inman Jang
  - Taewoo Han
  - Uiwon Hwang
  - Won-Suk Ohm
  - Myunghan Lee
year: 2023
tags:
  - active-noise-control
  - secondary-path-modeling
  - deep-neural-networks
  - time-varying-environments
  - filtered-x-least-mean-square
key_references:
  - title: Process of Silencing Sound Oscillations
    doi: US2043416A
    year: 1936
    role: foundation
    reason: This reference provides the foundational patent for active noise control.
    status: external
    linked_card: null
  - title: 'Active noise control: A tutorial review'
    doi: 10.1109/5.763000
    year: 1999
    role: survey
    reason: >-
      This is a comprehensive tutorial review of active noise control, covering
      algorithms and implementations.
    status: external
    linked_card: null
  - title: 'Active Noise Control Systems: Algorithms and DSP Implementations'
    doi: ''
    year: 1996
    role: foundation
    reason: >-
      This book is cited multiple times for fundamental concepts and algorithms
      in ANC, including the FxLMS algorithm and secondary path modeling.
    status: external
    linked_card: null
  - title: Online secondary path modeling for active sound quality control systems
    doi: 10.1016/j.apacoust.2019.06.010
    year: 2019
    role: related_work
    reason: >-
      This paper discusses online secondary path modeling, a relevant technique
      for time-varying environments.
    status: external
    linked_card: null
  - title: Deep learning
    doi: 10.1038/521436a
    year: 2015
    role: foundation
    reason: >-
      This is a foundational paper on deep learning, providing context for the
      use of DNNs in the proposed method.
    status: external
    linked_card: null
  - title: 'Scikit-learn: machine learning in Python'
    doi: 10.1109/TPAMI.2011.239
    year: 2011
    role: method
    reason: >-
      This reference details the Scikit-learn library used for implementing the
      DNN models.
    status: external
    linked_card: null
key_figure:
  status: cached
  figure_id: Fig. 2
  page: 2
  role: system_setup
  caption: >-
    Block diagram of ANC system using the FxLMS algorithm with real-time
    secondary path modeling based on a DNN.
  reason: >-
    This figure provides a high-level overview of the entire system,
    illustrating how the DNN-based secondary path modeling integrates with the
    FxLMS algorithm.
  image_ref: 1OPAD56ShRh1_i4twEpDpIZE_sS3EVVeG
  image_private: true
drive:
  - >-
    https://drive.google.com/file/d/1EuaEMyg9AsogT6D5jtsvd8kvYS3avmZo/view?usp=drivesdk
related: []
created: '2026-06-16'
reviewed_by: []
rating: null
ratings: []
comments: []
uploaded_by: WBX
uploaded_at: '2026-06-16T08:45:54.395Z'
pdf_uploaded_by: WBX
pdf_uploaded_at: '2026-06-16T08:41:40.802Z'
pdf_file_name: 0012_Im2023Deep.pdf
pdf_reused: false
activity:
  - action: pdf_uploaded
    by: WBX
    at: '2026-06-16T08:41:40.802Z'
    detail: 0012_Im2023Deep.pdf
  - action: card_published
    by: WBX
    at: '2026-06-16T08:45:54.395Z'
---
## Summary
This paper introduces a novel deep learning-assisted method for active noise control (ANC) in time-varying environments. The core innovation lies in a two-stage deep neural network (DNN) designed to estimate the secondary path impulse response in real-time, adapting to changing acoustic conditions. This addresses a critical limitation of traditional ANC systems, which struggle when the environment changes. The proposed method was experimentally validated in an airborne duct with a movable error sensor, simulating significant boundary condition shifts. Results demonstrated that the DNN-assisted ANC system could effectively reduce broadband noise by up to 10 dB, even under dramatic environmental changes, outperforming systems without real-time secondary path updates.

## Problem
Active noise control (ANC) systems rely heavily on an accurate estimation of the secondary path, which describes the acoustic and electronic transfer function between the secondary sound source and the error sensor. In static environments, this path is typically measured once and fixed. However, real-world applications, such as vehicle cabins or aircraft, present time-varying acoustic conditions. These variations, caused by factors like passenger movement or changes in geometry, degrade ANC performance if the secondary path estimation is not updated. Existing online update techniques often struggle with rapid and significant changes, can be intrusive due to auxiliary noise, and may not be practical for user comfort. Therefore, there is a need for an effective, real-time method to update the secondary path estimation in dynamic environments.

## Method
The proposed method employs a two-stage deep neural network (DNN) to estimate the secondary path impulse response in real-time. The secondary path, denoted by its impulse response $s(n)$, is characterized by two main components: the time of arrival ($a_n$) and the impulse response waveform ($w_s(n)$) after the arrival. The DNN approach aims to predict these components based on changing boundary conditions, represented by a set of parameters $m_b$.

**Stage 1: Time of Arrival Prediction**
A first DNN, $f_{\phi}(m_b)$, predicts the time of arrival $a_n$. This is crucial for aligning signals in the ANC system. The prediction is formulated as:
$$ \hat{a}_n = f_{\phi}(m_b) \quad (1) $$ 
where $\hat{a}_n$ is the estimated time of arrival and $\phi$ represents the parameters of the predictor. This predictor uses multi-layer perceptron (MLP) layers with an identity activation function.

**Stage 2: Impulse Response Waveform Prediction**
A second DNN, $f_{\psi}(m_b)$, predicts the impulse response waveform $w_s(n)$ that occurs after the time of arrival. This stage is more complex and uses more MLP layers with a hyperbolic tangent activation function:
$$ \hat{w}_s(n) = f_{\psi}(m_b) \quad (2) $$ 
where $\hat{w}_s(n)$ is the predicted impulse response waveform and $\psi$ represents its parameters.

**Combined Secondary Path Estimation**
The final estimated secondary path impulse response $\hat{s}(n)$ is constructed by combining the predicted time of arrival and waveform:
$$ \hat{s}(n) = \begin{cases} \hat{w}_s(n - \hat{a}_n) & \text{if } n \ge \hat{a}_n \\ 0 & \text{if } n < \hat{a}_n \end{cases} \quad (3) $$ 

**Training the DNNs**
The parameters of both DNNs are updated by minimizing specific loss functions. The loss for the time of arrival predictor is $L_a$, and for the waveform predictor is $L_w$: 
$$ L_a = E[(\hat{a}_n - a_n)^2] \quad (4) $$ 
$$ L_w = E[(\hat{w}_s(n) - w_s(n))^2] \quad (5) $$ 
These losses are minimized using stochastic gradient descent (SGD) with learning rates $\eta_a$ and $\eta_w$ respectively:
$$ \phi \leftarrow \phi - \eta_a \nabla_{\phi} L_a \quad (6) $$ 
$$ \psi \leftarrow \psi - \eta_w \nabla_{\psi} L_w \quad (7) $$ 

**Experimental Setup**
Experiments were conducted in an airborne duct with a movable error microphone to simulate time-varying boundary conditions. The system utilized an FxLMS algorithm for ANC, with the DNN performing real-time secondary path modeling. The DNN was trained using impulse responses measured at various microphone positions.

## Key results
The proposed DNN-based secondary path modeling technique demonstrated high accuracy. Using leave-one-out cross-validation (LOOCV), the system achieved a low Mean Squared Error (MSE) and normalized MSE, indicating effective prediction of the secondary path impulse response. A comparison with a naive end-to-end DNN approach showed that the two-stage method significantly outperformed the end-to-end method, particularly in accurately predicting the time of arrival (MAE of 0.06 vs. 24.05).

In terms of ANC performance, the system achieved a noise reduction of 7.8 dB when the error microphone was fixed. Crucially, when the error microphone was suddenly moved, simulating a drastic change in boundary conditions, the ANC system equipped with the DNN-based secondary path update maintained stable noise control. Without the update, the system failed, leading to a significant increase in sound pressure level (SPL). With the update, the system achieved a noise reduction of 9.3 dB, demonstrating robustness and continuous performance in the time-varying environment.

## Strengths
The primary strength of this work is the development of a DNN-based approach for real-time secondary path estimation that effectively handles time-varying acoustic environments. The two-stage prediction of time of arrival and impulse response waveform leads to high accuracy and robustness. The method is shown to be significantly better than a naive end-to-end approach. The experimental validation in a controlled airborne duct setup provides strong evidence for its practical feasibility and effectiveness in achieving substantial broadband noise reduction even under challenging, dynamic conditions.

## Limitations
The study focused on simulating boundary condition changes by moving the error microphone along a duct. While this effectively demonstrates the concept, it might not fully replicate the complexity of all real-world time-varying scenarios, such as those involving multiple moving sources or complex room geometries. The DNN training requires a dataset of impulse responses, which might need to be collected beforehand or through an initial learning phase. The paper mentions future work to expand to higher dimensions, implying current limitations in handling more complex multi-input/multi-output scenarios.

## Relevance to our group
This research is highly relevant to our group's interests in advanced signal processing for acoustic applications. The application of deep learning to improve the performance and robustness of active noise control systems, particularly in dynamic environments, aligns directly with our focus on intelligent audio processing. The methodology for real-time secondary path estimation using DNNs could be adapted or extended for other areas such as source separation, speech enhancement, or spatial audio in challenging acoustic conditions. The experimental validation in a controlled environment also provides a valuable benchmark and methodology for future research.

## Notes
The authors used Scikit-learn for implementing the DNN regressors. The sampling rate for the ANC experiment was set to 5 kHz, which is sufficient for the road noise (up to 1.5 kHz). The step size for the FxLMS algorithm was determined empirically as 0.03. The paper acknowledges support from Hyundai Motor Group.
