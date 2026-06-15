# Research Literature Hub — LLM Catalog

Use this file as the entry point for searching our internal literature library.
Search this catalog first, then open only the most relevant literature record files.
Do not assume private Google Drive PDFs are accessible.

Papers: 4

## Papers

### Xiao2023Spatially
- Title: Spatially selective active noise control systems
- Year: 2023
- Venue: J. Acoust. Soc. Am.
- Publication type: journal-paper
- Primary domain: active-noise-control
- Domains: active-noise-control, beamforming-arrays
- Tags: spatial-audio, microphone-array, adaptive-filtering, frost-algorithm, hybrid-anc
- Team weight: unrated
- Summary: This paper introduces a novel multi-channel active noise control (ANC) system designed for spatial selectivity. Unlike traditional ANC systems that aim to minimize all sound, this proposed system selectively reduces noise from undesired directions while preserving desired sound sources. The core innovation lies in imposing a spatial constraint, derived from the Frost algorithm, onto the cost function of a hybrid ANC…
- Key related papers:
  - [related_work] Combined feedforward-feedback noise reduction schemes for open-fitting hearing aids (2011, DOI: 10.1121/1.3657476) - This paper explores combined feedforward-feedback noise reduction for hearing aids, which is a precursor to hybrid ANC systems.
  - [foundation] An algorithm for linearly constrained adaptive array processing (1972, DOI: 10.1109/PROC.1972.8780) - This foundational work introduces the Frost algorithm, which is central to the spatial constraint used in the proposed method.
  - [related_work] Design and implementation of an active noise control headphone with directional hear-through capability (2020, DOI: 10.1109/TCE.2019.2953712) - This paper presents a related approach for ANC headphones with directional hear-through, offering a point of comparison.
  - [related_work] Integrated active noise control and noise reduction in hearing aids (2010, DOI: 10.1109/TASL.2010.2053743) - This work integrates ANC and noise reduction in hearing aids, touching upon similar concepts of selective noise control.
  - [foundation] Adaptive Filter Theory (2002) - This is a standard textbook on adaptive filters, providing theoretical background for the adaptive algorithms used.
- Record: https://raw.githubusercontent.com/yzyzieee/Research-Literature-Hub/main/official/Xiao2023Spatially.md

### Xie2024Cognitive
- Title: Cognitive Virtual Sensing Technique for Feedforward Active Noise Control
- Year: 2024
- Venue: ICASSP
- Publication type: conference-paper
- Primary domain: active-noise-control
- Domains: active-noise-control
- Tags: active-noise-control, virtual-sensing, adaptive-filtering, machine-learning, convolutional-neural-networks
- Team weight: unrated
- Summary: This paper introduces a cognitive virtual sensing (VS) technique to improve the performance of active noise control (ANC) systems, particularly when noise characteristics or primary paths change over time. Unlike conventional VS methods that struggle with such variations, the proposed cognitive VS technique uses a lightweight classifier to analyze both reference and monitoring microphone signals. This allows the sys…
- Key related papers:
  - [foundation] A hybrid SFANC-FxNLMS algorithm for active noise control based on deep learning (2022, DOI: 10.1109/LSP.2022.3162311) - This paper introduces a hybrid SFANC-FxNLMS algorithm using a lightweight M6-res network for noise classification, which is a precursor to the cognitive VS technique proposed here.
  - [foundation] Selective virtual sensing technique for multi-channel feedforward active noise control systems (2019, DOI: 10.1109/ICASSP.2019.2400084) - This work is cited as a previous selective VS technique that the proposed cognitive VS technique improves upon, particularly in handling primary path variations.
  - [related_work] Robust performance of virtual sensing methods for active noise control (2021, DOI: 10.1016/j.ymssp.2020.107515) - This paper discusses the robustness of virtual sensing methods, providing context for the challenges addressed by the cognitive VS technique.
  - [method] MobileNets: Efficient convolutional neural networks for mobile vision applications (2017, DOI: 10.48550/arXiv.1704.04816) - This paper introduces depthwise separable convolution, a key component adopted and modified for the lightweight classifier in the proposed cognitive VS technique.
  - [related_work] Feedforward selective fixed-filter active noise control: Algorithm and implementation (2020, DOI: 10.1109/TASLP.2020.2987384) - This paper details the selective fixed-filter active noise control (SFANC) system, which is a foundational concept that the cognitive VS technique builds upon and enhances.
- Record: https://raw.githubusercontent.com/yzyzieee/Research-Literature-Hub/main/official/Xie2024Cognitive.md

### Yang2026Co-initialization
- Title: Co-initialization of Control Filter and Secondary Path via Meta-Learning for Active Noise Control
- Year: 2026
- Venue: ICASSP
- Publication type: conference-paper
- Primary domain: active-noise-control
- Domains: active-noise-control, machine-learning-audio
- Tags: active-noise-control, fxlms, secondary-path-modeling, model-agnostic-meta-learning, few-shot-learning, initialization
- Team weight: unrated
- Summary: This paper introduces a novel Model-Agnostic Meta-Learning (MAML) based co-initialization strategy for Feedforward Filtered-x Least Mean Squares (FxLMS) active noise control (ANC) systems. The primary goal is to improve the initial performance and adaptation speed of ANC systems when the acoustic environment changes. Unlike previous methods that might initialize only the control filter or rely on standard FxLMS with…
- Key related papers:
  - [related_work] Online secondary path modeling in active noise control without auxiliary noise (2019, DOI: 10.1121/1.5121395) - This paper explores online secondary path modeling, a core component addressed by the proposed initialization method.
  - [foundation] Model-agnostic meta-learning for fast adaptation of deep networks (2017, DOI: 10.48550/arXiv.1703.03400) - This is the foundational paper for Model-Agnostic Meta-Learning (MAML), the core meta-learning technique used in this work.
  - [related_work] Fast adaptive active noise control based on modified model-agnostic meta-learning algorithm (2021, DOI: 10.1109/LSP.2020.3044781) - This prior work also applies MAML to ANC, but focuses on initializing only the control filter, whereas this paper co-initializes both.
  - [foundation] On comparison of online secondary path modeling methods with auxiliary noise (2005, DOI: 10.1109/TSA.2005.853910) - This paper provides a foundational comparison of online secondary path modeling methods, which is the context for the proposed initialization.
  - [dataset] Acoustic path database for ANC in-ear headphone development (2019, DOI: 10.20382/RWT01386) - This paper provides the measured acoustic paths used for training and evaluation in the proposed method.
- Record: https://raw.githubusercontent.com/yzyzieee/Research-Literature-Hub/main/official/Yang2026Co-initialization.md

### jiang2022integration
- Title: An Integration Development of Traditional Algorithm and Neural Network for Active Noise Cancellation
- Year: 2022
- Venue: 2022 IEEE International Workshop on Machine Learning for Signal Processing (MLSP)
- Publication type: conference-paper
- Primary domain: active-noise-control
- Domains: active-noise-control, machine-learning-audio
- Tags: adaptive-filters, iir-filters, equation-error, deep-learning, dual-signal-transformation-lstm, convolutional-encoder-decoder
- Team weight: unrated
- Summary: This paper proposes an integrated active noise cancellation (ANC) system that combines a traditional adaptive IIR filter with a deep learning model to address nonlinear distortions that limit the performance of conventional ANC methods. The adaptive IIR filter first handles the linear component of the noise, and a subsequent neural network, specifically a Dual-Signal Transformation LSTM (DTLN) followed by a TasNet-l…
- Key related papers:
  - [related_work] Deep ANC: A Deep Learning Approach to Active Noise Control (2021, DOI: 10.1016/j.neunet.2021.06.014) - This paper proposes a deep learning method for nonlinear ANC, similar to the neural network component of the current work.
  - [foundation] Development of Equation-Error Adaptive IIR-Filter-Based Active Noise Control System (2020, DOI: 10.1016/j.apacoust.2020.107226) - This reference introduces the Equation-Error (EE) based adaptive IIR filter, which is used as the traditional component in the proposed integrated system.
  - [method] Dual-signal transformation LSTM network for real-time noise suppression (2020) - This paper describes the Dual-Signal Transformation LSTM (DTLN) network, which is adapted for the frequency-domain processing in the proposed system.
  - [method] Conv-TasNet: Surpassing Ideal Time–Frequency Magnitude Masking for Speech Separation (2019, DOI: 10.1109/TASLP.2019.2905115) - This paper introduces the TasNet structure, which is adapted for the time-domain processing in the proposed system.
  - [baseline] The Filtered-X LMS Algorithm (1992, DOI: 10.1109/78.67874) - The Filtered-X LMS (FXLMS) algorithm is a widely used traditional method for ANC and serves as a baseline for comparison.
- Record: https://raw.githubusercontent.com/yzyzieee/Research-Literature-Hub/main/official/jiang2022integration.md
