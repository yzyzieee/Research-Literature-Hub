---
title: >-
  Real-time implementation and explainable AI analysis of delayless CNN-based
  selective fixed-filter active noise control
entry_type: literature
publication_type: journal-paper
primary_domain: active-noise-control
domains:
  - active-noise-control
  - machine-learning-audio
venue: Mechanical Systems and Signal Processing
doi: 'https://doi.org/10.1016/j.ymssp.2024.111364'
abstract: >-
  The selective fixed-filter active noise control (SFANC) approach can select
  suitable pre-trained control filters for different types of noise. With the
  learning ability of convolutional neural network (CNN), the CNN-based SFANC
  method can automatically learn its parameters from noise data. Combining
  practical experience, this paper abstracts ANC as a Markov progress and
  provides a detailed theoretical analysis to verify the reasonableness of the
  CNN-based SFANC method. To validate its effectiveness, we implement the method
  in a multichannel ANC window, where the CNN operating in the co-processor
  collaborates with the real-time controller to realize delayless noise control.
  Additionally, an explainable AI technique is used to analyze the underlying
  principle of the CNN-based SFANC method, enhancing its interpretability in
  acoustic applications. Numerical simulations and real-time experiments
  demonstrate that the CNN-based SFANC method achieves not only satisfactory
  noise reduction performance for broadband and real-world noises but also
  excellent transferability.
status: official
citation_key: Luo2024Real-time
authors:
  - Zhengding Luo
  - Dongyuan Shi
  - Junwei Ji
  - Xiaoyi Shen
  - Woon-Seng Gan
year: 2024
tags:
  - active-noise-control
  - selective-fixed-filter-anc
  - delayless-noise-control
  - convolutional-neural-network
  - explainable-ai
  - layercam
key_references:
  - title: >-
      Selective fixed-filter active noise control based on frequency response
      matching in headphones
    doi: 10.1016/j.apacoust.2023.109505
    year: 2023
    role: foundation
    reason: >-
      This paper introduces the selective fixed-filter ANC (SFANC) concept,
      which is foundational to the presented work.
    status: external
    linked_card: null
  - title: >-
      Feedforward selective fixed-filter active noise control: Algorithm and
      implementation
    doi: 10.1109/TASLP.2020.2987499
    year: 2020
    role: foundation
    reason: >-
      This work provides the algorithmic basis for SFANC, which the current
      paper builds upon.
    status: external
    linked_card: null
  - title: >-
      Selective fixed-filter active noise control based on convolutional neural
      network
    doi: 10.1016/j.sigpro.2021.108317
    year: 2022
    role: method
    reason: >-
      This paper first proposed using CNNs for SFANC, directly preceding the
      current work.
    status: external
    linked_card: null
  - title: 'LayerCAM: Exploring hierarchical class activation maps for localization'
    doi: 10.1109/TIP.2021.3090407
    year: 2021
    role: method
    reason: >-
      This paper introduces LayerCAM, the explainable AI technique used in the
      current study.
    status: external
    linked_card: null
  - title: 'ShuffleNet V2: Practical guidelines for efficient CNN architecture design'
    doi: 10.1007/978-3-030-00827-1_3
    year: 2018
    role: method
    reason: >-
      The paper's CNN architecture is based on ShuffleNet V2, making it a
      relevant methodological reference.
    status: external
    linked_card: null
  - title: >-
      Transferable latent of cnn-based selective fixed-filter active noise
      control
    doi: 10.1109/TASLP.2023.3334327
    year: 2023
    role: related_work
    reason: >-
      This related work by the same authors investigates the transferability of
      CNN-based SFANC, a key aspect also addressed in the current paper.
    status: external
    linked_card: null
key_figure:
  status: cached
  figure_id: Fig. 12
  page: 12
  role: system_setup
  caption: >-
    The CNN-based SFANC method implemented in the ANC window, where the
    co-processor coordinates with the real-time controller through UDP protocol.
  reason: >-
    This figure shows the practical implementation of the system in an ANC
    window, highlighting the hardware setup and communication protocol.
  image_ref: 14GQRtrZhtmTk5VWesERgw19FdRI96K5l
  image_private: true
drive:
  - >-
    https://drive.google.com/file/d/1qs_pcOysc9-9UKFgp0oKyyRDHVga03_V/view?usp=drivesdk
related: []
created: '2026-06-16'
reviewed_by: []
rating: null
ratings: []
comments: []
uploaded_by: YZY
uploaded_at: '2026-06-16T12:43:41.900Z'
pdf_uploaded_by: YZY
pdf_uploaded_at: '2026-06-16T12:33:46.294Z'
pdf_file_name: 0015_Luo2024Real-time.pdf
pdf_reused: false
activity:
  - action: pdf_uploaded
    by: YZY
    at: '2026-06-16T12:33:46.294Z'
    detail: 0015_Luo2024Real-time.pdf
  - action: card_published
    by: YZY
    at: '2026-06-16T12:43:41.900Z'
---
## Summary
This paper presents a real-time implementation and explainable AI analysis of a delayless Convolutional Neural Network (CNN)-based Selective Fixed-Filter Active Noise Control (SFANC) method. The approach leverages CNNs to automatically learn parameters for selecting appropriate pre-trained control filters based on noise characteristics. Theoretical analysis frames ANC as a Markov process to justify the CNN-based SFANC method. The system was implemented in a multichannel ANC window, achieving delayless noise control through efficient co-processor and real-time controller coordination. Explainable AI (LayerCAM) was used to analyze the CNN's decision-making process. Simulations and experiments confirm the method's effectiveness in reducing broadband and real-world noises, demonstrating satisfactory noise reduction and excellent transferability.

## Problem
Traditional Active Noise Control (ANC) systems often rely on adaptive algorithms like FxLMS, which suffer from slow convergence, poor tracking, and potential divergence. Fixed-filter ANC offers faster response and robustness but is optimized for specific noise types, leading to suboptimal performance on others. Selective Fixed-Filter ANC (SFANC) addresses this by selecting from pre-trained filters, but parameter selection can be challenging. Existing deep learning-based ANC methods often replace the entire control filter with a neural network, leading to high computational complexity and latency that violates ANC causality requirements. Furthermore, practical implementations and analyses of CNN-based SFANC methods, especially concerning their performance and transferability in real-world scenarios with varying acoustic paths, are lacking.

## Method
The proposed method, CNN-based SFANC, integrates a 2D CNN with a fixed-filter ANC framework. The core idea is to use a CNN to classify incoming noise and select the most suitable pre-trained control filter from a database. This process is theoretically grounded by modeling the ANC system as a Markov process, specifically a Hidden Markov Model (HMM), where the optimal control filter's state transitions are considered. The likelihood of a control filter being optimal is related to the current reference signal, leading to the formulation of filter selection as maximizing this likelihood.

**1. Pre-training Control Filters:** M pre-trained control filters are generated using the FxLMS algorithm on M different types of broadband white noises. These filters are stored in a database.

**2. Control Filter Selection via 2D CNN:** A lightweight 2D CNN, modified from ShuffleNet V2, is trained on a dataset of noise instances (mel-spectrograms) and their corresponding optimal filter indices. The CNN learns a mapping from noise mel-spectrograms to the index of the best pre-trained control filter. The training objective is to minimize the cross-entropy loss between the CNN's predicted probabilities and the true noise labels.

**3. Delayless Real-time Noise Cancellation:** The system comprises a co-processor running the trained 2D CNN and a real-time controller. The CNN operates at a frame rate to select the control filter, which is then transmitted to the real-time controller operating at the sampling rate (16 kHz). This parallel processing ensures delayless noise control, as the CNN's processing latency does not impact the real-time control loop. The control signal $y_i(n)$ is generated using the selected filter $w(n)$ and reference signal $x_i(n)$, and the error signal $e_i(n)$ is computed as $d_i(n) - y_i(n) * s(n)$, where $d_i(n)$ is the disturbance and $s(n)$ is the secondary path impulse response.

**4. Explainable AI Analysis:** LayerCAM is employed to visualize the decision-making process of the 2D CNN. It generates class activation maps highlighting the regions in the input mel-spectrogram that are most influential for filter selection. This analysis reveals that the CNN primarily focuses on the frequency band information of the noise.

**Theoretical Formulation:** The acoustic environment is modeled as a linear dynamic system: $w_o(n+1) = a w_o(n) + 	ilde{w}(n)$, where $w_o(n)$ is the optimal control filter, $a$ is a fixed parameter, and $	ilde{w}(n)$ is process noise. The disturbance $d(n)$ is observed as $d(n) = x'^T(n) w_o(n) + 
u(n)$, where $x'(n)$ is the filtered reference signal and $
u(n)$ is measurement noise. Assuming a slow-varying optimal filter ($w_o(n+1) 	hickapprox w_o(n)$) and a discrete solution space for $w_o$, the problem is framed as an HMM. The probability of the next optimal filter state $P[w_o(n+1) = w_i | x(0), 	ext{...}, x(n)]$ is proportional to the likelihood $P[x(n) | w_o(n) = w_j]$, which can be learned by a deep learning model.

## Key results
- The proposed 2D CNN achieved a classification accuracy of 98.55% on a synthetic noise dataset, outperforming other networks like Mobilenet v2, ResNet, and DenseNet in terms of accuracy while using significantly fewer parameters (0.25M).
- t-SNE visualization confirmed that the learned noise features are well-separated and discriminative.
- LayerCAM analysis revealed that the CNN-based SFANC method primarily relies on the frequency band information of the noise to select control filters.
- Numerical simulations showed that the CNN-based SFANC method achieved significantly higher noise reduction levels (e.g., 16.82 dB for aircraft noise, 15.39 dB for compressor noise) compared to the FxLMS algorithm (4.15 dB and 7.29 dB, respectively).
- Real-time experiments on a 4-channel ANC window demonstrated effective broadband noise cancellation (up to 20.74 dB for specific bands) and real noise attenuation (around 12.3-12.4 dB for aircraft and compressor noise).
- The method exhibited excellent transferability, with a CNN model trained on synthetic acoustic paths performing well on real acoustic paths without retraining.

## Strengths
- **Delayless Operation:** Achieves delayless noise control through efficient parallel processing between a co-processor (CNN) and a real-time controller.
- **Data-Driven Filter Selection:** Automatically learns to select appropriate control filters, eliminating manual tuning.
- **High Accuracy and Efficiency:** The proposed lightweight CNN achieves high classification accuracy with a low parameter count, making it suitable for embedded systems.
- **Interpretability:** Explainable AI techniques (LayerCAM) provide insights into the CNN's decision-making process.
- **Robustness and Transferability:** Demonstrates good performance on real-world noises and transferability across different acoustic paths without retraining.
- **Simplified Deployment:** Real-time implementation does not require error microphones, simplifying system setup.

## Limitations
- The performance of SFANC is inherently limited by the quality and coverage of the pre-trained control filters. If a noise type falls outside the scope of the pre-trained filters, performance may degrade.
- While the method shows good transferability, significant changes in acoustic paths might still necessitate retraining or fine-tuning of the CNN or re-generating pre-trained filters.
- The paper mentions that the method is less effective at reducing noise in specific frequency ranges (e.g., 325-450 Hz and 450-575 Hz) due to limitations of the corresponding pre-trained filters.

## Relevance to our group
This work is highly relevant to our group's research in active noise control and audio signal processing. Specifically, the integration of deep learning (CNNs) for adaptive filter selection in ANC systems aligns with our interest in leveraging machine learning for enhanced audio processing. The focus on delayless implementation, real-time performance, and system transferability addresses practical challenges in deploying ANC technologies. Furthermore, the use of explainable AI to understand the model's behavior is crucial for developing trustworthy and interpretable audio systems. The theoretical grounding using Markov processes also offers valuable insights into the underlying dynamics of ANC systems.

## Notes
The code for this work is available at https://github.com/Luo-Zhengding/SFANC-Window. The paper successfully bridges theoretical analysis, algorithmic development, explainable AI, and practical implementation, showcasing a comprehensive approach to CNN-based SFANC.
