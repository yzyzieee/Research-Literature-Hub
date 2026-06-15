---
title: >-
  An Integration Development of Traditional Algorithm and Neural Network for
  Active Noise Cancellation
entry_type: literature
publication_type: conference-paper
primary_domain: active-noise-control
domains:
  - active-noise-control
  - machine-learning-audio
venue: >-
  2022 IEEE International Workshop on Machine Learning for Signal Processing
  (MLSP)
doi: 10.1109/MLSP55214.2022.9943441
abstract: >-
  Traditional active noise cancellation (ANC) methods are based on adaptive
  signal processing with adaptive algorithms as the foundations. They are linear
  systems and do not perform satisfactorily in the presence of nonlinear
  distortions. In this paper, we exploit the nonlinear processing capabilities
  of neural networks to address nonlinear ANC problems. The main idea is to
  employ deep learning to encode optimal control parameters corresponding to
  different noises and environments. We first actively remove the noise or noisy
  speech through the traditional adaptive filter methods, and then the residual
  noise and estimated noise are sent into the neural network to eliminate the
  nonlinear distortions. Regardless of whether the reference signal is noise or
  noisy speech, ANC system can be achieved by training a neural network. The
  experimental results show that the proposed ANC system demonstrates a good
  noise reduction effect on complex noises, and produces a superior performance
  compared with the traditional methods.
status: official
citation_key: jiang2022integration
authors:
  - Yihang Jiang
  - Hongqing Liu
  - Yi Zhou
  - Zhen Luo
year: 2022
tags:
  - adaptive-filters
  - iir-filters
  - equation-error
  - deep-learning
  - dual-signal-transformation-lstm
  - convolutional-encoder-decoder
key_references:
  - title: 'Deep ANC: A Deep Learning Approach to Active Noise Control'
    doi: 10.1016/j.neunet.2021.06.014
    year: 2021
    role: related_work
    reason: >-
      This paper proposes a deep learning method for nonlinear ANC, similar to
      the neural network component of the current work.
    status: external
    linked_card: null
  - title: >-
      Development of Equation-Error Adaptive IIR-Filter-Based Active Noise
      Control System
    doi: 10.1016/j.apacoust.2020.107226
    year: 2020
    role: foundation
    reason: >-
      This reference introduces the Equation-Error (EE) based adaptive IIR
      filter, which is used as the traditional component in the proposed
      integrated system.
    status: external
    linked_card: null
  - title: Dual-signal transformation LSTM network for real-time noise suppression
    doi: ''
    year: 2020
    role: method
    reason: >-
      This paper describes the Dual-Signal Transformation LSTM (DTLN) network,
      which is adapted for the frequency-domain processing in the proposed
      system.
    status: external
    linked_card: null
  - title: >-
      Conv-TasNet: Surpassing Ideal Time–Frequency Magnitude Masking for Speech
      Separation
    doi: 10.1109/TASLP.2019.2905115
    year: 2019
    role: method
    reason: >-
      This paper introduces the TasNet structure, which is adapted for the
      time-domain processing in the proposed system.
    status: external
    linked_card: null
  - title: The Filtered-X LMS Algorithm
    doi: 10.1109/78.67874
    year: 1992
    role: baseline
    reason: >-
      The Filtered-X LMS (FXLMS) algorithm is a widely used traditional method
      for ANC and serves as a baseline for comparison.
    status: external
    linked_card: null
key_figure:
  status: cached
  figure_id: '1'
  page: 2
  role: system_setup
  caption: >-
    System block diagram showing the integration of the traditional adaptive IIR
    filter and the neural network.
  reason: >-
    Figure 1 provides a clear overview of how the traditional adaptive filter
    and the neural network are combined in the proposed ANC system, illustrating
    the flow of signals.
  image_ref: 11yfHR0vKrSM_HJaCAU_dHLrukS2nU-5j
  image_private: true
drive:
  - >-
    https://drive.google.com/file/d/1-6LwWxCXLK6hWpHyXE9GtAJBwkxzZVSc/view?usp=drivesdk
related: []
created: '2026-06-15'
reviewed_by: []
rating: null
ratings: []
comments: []
uploaded_by: YZY
uploaded_at: '2026-06-15T12:55:11.329Z'
pdf_uploaded_by: YZY
pdf_uploaded_at: '2026-06-15T12:53:44.696Z'
pdf_file_name: 0006_jiang2022integration.pdf
pdf_reused: false
activity:
  - action: pdf_uploaded
    by: YZY
    at: '2026-06-15T12:53:44.696Z'
    detail: 0006_jiang2022integration.pdf
  - action: card_published
    by: YZY
    at: '2026-06-15T12:55:11.329Z'
---
## Summary
This paper proposes an integrated active noise cancellation (ANC) system that combines a traditional adaptive IIR filter with a deep learning model to address nonlinear distortions that limit the performance of conventional ANC methods. The adaptive IIR filter first handles the linear component of the noise, and a subsequent neural network, specifically a Dual-Signal Transformation LSTM (DTLN) followed by a TasNet-like convolutional encoder-decoder structure, is used to eliminate residual nonlinear distortions. Experimental results demonstrate that this hybrid approach achieves significantly better noise reduction compared to traditional methods like FXLMS and FULMS, particularly on complex noises and noisy speech, while also showing good generalization to unseen noise types.

## Problem
Traditional active noise cancellation (ANC) systems, primarily based on adaptive signal processing algorithms like FXLMS, are inherently linear. This linearity limits their effectiveness in environments with nonlinear distortions, where they fail to achieve satisfactory noise reduction. While adaptive IIR filters offer lower computational complexity than FIR filters, they can suffer from instability issues. Existing deep learning approaches for ANC, such as Deep ANC, can handle nonlinearity but may require significant computational resources or extensive training data. There is a need for an ANC system that can effectively handle both linear and nonlinear noise components while maintaining reasonable complexity and good generalization capabilities.

## Method
The proposed system integrates a traditional adaptive IIR filter with a deep learning model. The process begins with an Equation-Error (EE) based adaptive IIR filter to remove the linear part of the noise. The error signal $e(n)$ is defined as $e(n) = d(n) - s(n) * y(n)$, where $d(n)$ is the primary noise signal, $s(n)$ is the impulse response of the secondary path, and $y(n)$ is the output of the adaptive filter. The IIR filter output $y(n)$ is given by:
$$y(n) = \sum_{i=0}^{N_a-1} a_i(n) x(n-i) + \sum_{j=0}^{N_b-1} b_j(n) \hat{d}(n-j)$$ 
where $a_i(n)$ and $b_j(n)$ are the adaptive IIR filter coefficients, $x(n)$ is the reference noise signal, and $\hat{d}(n)$ is an estimate of the desired signal. The EE model avoids recursive terms in the output, thus preventing instability. The coefficients are updated using LMS-based rules:
$$a(n+1) = a(n) + \mu \hat{x}(n) e(n)$$ 
$$b(n+1) = b(n) + \mu \hat{d}'(n-1) e(n)$$ 
After the adaptive IIR filter processes the signal, the residual noise and the estimated noise are fed into a neural network for further nonlinear distortion removal. This neural network consists of two main parts: 
1.  **Frequency Domain Processing (DTLN-based):** The residual noise $e(n)$ and the estimated noise $y(n)$ are transformed into the frequency domain using STFT. A Dual-Signal Transformation LSTM (DTLN) network, adapted from [12], processes these frequency-domain representations. It uses two LSTM layers followed by a fully connected layer and a sigmoid activation to generate a mask. This mask is applied to the residual noise's spectrogram to enhance it.
2.  **Time Domain Processing (TasNet-like):** The enhanced signal is then processed in the time domain using a structure inspired by TasNet [13]. This involves a convolutional encoder-decoder architecture. The encoder maps input segments $x_k$ to a representation $w$ via $w = H(xU)$, where $U$ are encoder basis functions and $H$ is a nonlinear function (ReLU). The decoder reconstructs the waveform $\hat{x}$ using $ \hat{x} = wV $, where $V$ are decoder basis functions. Mask estimation is performed using stacked 1-D dilated convolutional blocks, including a Temporal Convolutional Network (TCN) [14] with exponentially increasing dilation factors. The output of the TCN is used to estimate masks $m_i$ which are applied element-wise to the mixture representation $w$ to obtain source representations $d_i$. Finally, the decoder reconstructs the enhanced source waveforms $\hat{s}_i$ using $ \hat{s}_i = d_i V $. The 1-D convolution blocks utilize PReLU activation [16] and global layer normalization (gLN) [11].

The system is trained end-to-end to maximize Scale-Invariant Signal-to-Noise Ratio (SI-SNR) [19, 20]. Performance is evaluated using STOI, PESQ, and NMSE.

## Key results
The experimental results show significant improvements over traditional methods. When the reference signal is pure noise:
*   **Engine Noise:** The proposed method achieved an NMSE of -68.07 dB, compared to -9.17 dB for FXLMS and -12.75 dB for the EE-based IIR filter (FULMS).
*   **Factory Noise:** The proposed method achieved -71.34 dB, compared to -8.84 dB for FXLMS and -14.46 dB for FULMS.
*   **Babble Noise:** The proposed method achieved -60.78 dB, compared to -6.04 dB for FXLMS and -9.07 dB for FULMS.

When the reference signal is noisy speech:
*   The proposed model consistently outperformed FXLMS and the EE-based IIR filter in terms of STOI and PESQ across various SNRs (5dB, 15dB, 20dB). For instance, at 20dB SNR, the proposed model achieved STOI of 0.93 and PESQ of 3.31, compared to 0.72 and 1.98 for FXLMS, and 0.92 and 3.18 for FULMS.

The proposed method also demonstrated good generalization ability to untrained noises.

## Strengths
*   **Handles Nonlinearity:** Effectively addresses nonlinear distortions that traditional linear ANC methods struggle with, by leveraging the power of neural networks.
*   **Hybrid Approach:** Combines the efficiency and stability of adaptive IIR filters for linear components with the nonlinear processing capabilities of deep learning.
*   **Improved Performance:** Achieves significantly better noise reduction (lower NMSE) and speech quality (higher STOI/PESQ) compared to traditional algorithms.
*   **Lower Complexity:** The EE-based IIR filter used has a lower order (8 vs. 32 for FXLMS) and faster convergence, potentially reducing computational load compared to purely deep learning or high-order FIR filter approaches.
*   **Generalization:** Demonstrates good performance on unseen noise types, indicating robustness.

## Limitations
*   **Complexity of Deep Learning Component:** While the IIR filter is low-order, the deep learning components (DTLN, TCN, encoder-decoder) can still be computationally intensive and require significant training data.
*   **Integration Challenges:** The optimal way to balance the contributions of the adaptive filter and the neural network, and the specific design of the interface between them, might require further tuning.
*   **Potential for Instability in IIR:** Although the EE model avoids recursive terms in the output, the underlying adaptive IIR filter adaptation process could still theoretically face challenges in highly dynamic acoustic environments, though this is mitigated by the subsequent neural network.

## Relevance to our group
This work is highly relevant to our group's research in audio signal processing, particularly in areas like speech enhancement, source separation, and active noise control. The paper presents a novel hybrid approach that leverages deep learning to overcome limitations of traditional signal processing techniques. The integration of adaptive filtering with neural networks for noise cancellation is a promising direction. Understanding the architecture of the DTLN and TasNet-inspired components, as well as the experimental evaluation methodology (SI-SNR, STOI, PESQ, NMSE), can provide valuable insights for our own projects involving complex acoustic environments and the application of machine learning to audio problems.

## Notes
The paper uses an EE-based adaptive IIR filter, which is noted for avoiding unstable poles by not having recursive terms in its output, differentiating it from other IIR filter approaches. The neural network architecture combines frequency-domain processing (DTLN) with time-domain processing (convolutional encoder-decoder), suggesting a multi-stage approach to noise cancellation. The use of SI-SNR as the primary training objective and STOI/PESQ for evaluation aligns with common practices in speech processing research.
