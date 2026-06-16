# Research Literature Hub — LLM Catalog

Use this file as the entry point for searching our internal literature library.
Search this catalog first, then open only the most relevant literature record files.
Do not assume private Google Drive PDFs are accessible.

Papers: 9

## Papers

### Chen2022Secondary
- Title: A Secondary Path-Decoupled Active Noise Control Algorithm Based on Deep Learning
- Year: 2022
- Venue: IEEE SIGNAL PROCESSING LETTERS
- Publication type: journal-paper
- Primary domain: active-noise-control
- Domains: active-noise-control, machine-learning-audio
- Tags: active-noise-control, nonlinear-secondary-path, deep-learning, convolutional-recurrent-network, adaptive-filter
- Team weight: unrated
- Summary: This paper introduces a novel Secondary Path-Decoupled Active Noise Control (SPD-ANC) algorithm that leverages deep learning to address the performance degradation and filter divergence issues in conventional ANC systems caused by nonlinearities in the secondary path. The proposed method utilizes two time-domain Convolutional Recurrent Networks (CRNs) to model the nonlinear secondary path and its inverse. This allow…
- Key related papers:
  - [foundation] Active noise control: A tutorial review (1999, DOI: 10.1109/PROC.1999.769127) - Provides a foundational tutorial on active noise control systems.
  - [related_work] Nonlinear FXLMS algorithm for active noise control systems with saturation nonlinearity (2012, DOI: 10.1109/IEEJ.2012.2222118) - Discusses nonlinear FXLMS algorithms for ANC, a relevant baseline for handling secondary path nonlinearities.
  - [related_work] Deep ANC: A deep learning approach to active noise control (2021, DOI: 10.1016/j.neunet.2021.06.014) - Introduces a deep learning approach to ANC, serving as a comparison point for deep learning methods.
  - [method] A time-domain convolutional recurrent network for packet loss concealment (2021, DOI: 10.1109/ICASSP47223.2021.9438948) - Introduces the time-domain convolutional recurrent network (CRN) architecture used in the proposed method.
  - [baseline] Performance comparison of the FXLMS, non-linear FXLMS and leaky FXLMS algorithms in nonlinear active control applications (2002, DOI: 10.1109/EUSIPCO.2002.1043226) - Compares traditional and nonlinear FXLMS algorithms, providing context for performance evaluation.
- Record: https://raw.githubusercontent.com/yzyzieee/Research-Literature-Hub/main/official/Chen2022Secondary.md

### Im2023Deep
- Title: Deep learning-assisted active noise control in a time-varying environment
- Year: 2023
- Venue: Journal of Mechanical Science and Technology
- Publication type: journal-paper
- Primary domain: active-noise-control
- Domains: active-noise-control, machine-learning-audio
- Tags: active-noise-control, secondary-path-modeling, deep-neural-networks, time-varying-environments, filtered-x-least-mean-square
- Team weight: unrated
- Summary: This paper introduces a novel deep learning-assisted method for active noise control (ANC) in time-varying environments. The core innovation lies in a two-stage deep neural network (DNN) designed to estimate the secondary path impulse response in real-time, adapting to changing acoustic conditions. This addresses a critical limitation of traditional ANC systems, which struggle when the environment changes. The propo…
- Key related papers:
  - [foundation] Process of Silencing Sound Oscillations (1936, DOI: US2043416A) - This reference provides the foundational patent for active noise control.
  - [survey] Active noise control: A tutorial review (1999, DOI: 10.1109/5.763000) - This is a comprehensive tutorial review of active noise control, covering algorithms and implementations.
  - [foundation] Active Noise Control Systems: Algorithms and DSP Implementations (1996) - This book is cited multiple times for fundamental concepts and algorithms in ANC, including the FxLMS algorithm and secondary path modeling.
  - [related_work] Online secondary path modeling for active sound quality control systems (2019, DOI: 10.1016/j.apacoust.2019.06.010) - This paper discusses online secondary path modeling, a relevant technique for time-varying environments.
  - [foundation] Deep learning (2015, DOI: 10.1038/521436a) - This is a foundational paper on deep learning, providing context for the use of DNNs in the proposed method.
  - [method] Scikit-learn: machine learning in Python (2011, DOI: 10.1109/TPAMI.2011.239) - This reference details the Scikit-learn library used for implementing the DNN models.
- Record: https://raw.githubusercontent.com/yzyzieee/Research-Literature-Hub/main/official/Im2023Deep.md

### Luo2024Real-time
- Title: Real-time implementation and explainable AI analysis of delayless CNN-based selective fixed-filter active noise control
- Year: 2024
- Venue: Mechanical Systems and Signal Processing
- Publication type: journal-paper
- Primary domain: active-noise-control
- Domains: active-noise-control, machine-learning-audio
- Tags: active-noise-control, selective-fixed-filter-anc, delayless-noise-control, convolutional-neural-network, explainable-ai, layercam
- Team weight: unrated
- Summary: This paper presents a real-time implementation and explainable AI analysis of a delayless Convolutional Neural Network (CNN)-based Selective Fixed-Filter Active Noise Control (SFANC) method. The approach leverages CNNs to automatically learn parameters for selecting appropriate pre-trained control filters based on noise characteristics. Theoretical analysis frames ANC as a Markov process to justify the CNN-based SFA…
- Key related papers:
  - [foundation] Selective fixed-filter active noise control based on frequency response matching in headphones (2023, DOI: 10.1016/j.apacoust.2023.109505) - This paper introduces the selective fixed-filter ANC (SFANC) concept, which is foundational to the presented work.
  - [foundation] Feedforward selective fixed-filter active noise control: Algorithm and implementation (2020, DOI: 10.1109/TASLP.2020.2987499) - This work provides the algorithmic basis for SFANC, which the current paper builds upon.
  - [method] Selective fixed-filter active noise control based on convolutional neural network (2022, DOI: 10.1016/j.sigpro.2021.108317) - This paper first proposed using CNNs for SFANC, directly preceding the current work.
  - [method] LayerCAM: Exploring hierarchical class activation maps for localization (2021, DOI: 10.1109/TIP.2021.3090407) - This paper introduces LayerCAM, the explainable AI technique used in the current study.
  - [method] ShuffleNet V2: Practical guidelines for efficient CNN architecture design (2018, DOI: 10.1007/978-3-030-00827-1_3) - The paper's CNN architecture is based on ShuffleNet V2, making it a relevant methodological reference.
  - [related_work] Transferable latent of cnn-based selective fixed-filter active noise control (2023, DOI: 10.1109/TASLP.2023.3334327) - This related work by the same authors investigates the transferability of CNN-based SFANC, a key aspect also addressed in the current paper.
- Record: https://raw.githubusercontent.com/yzyzieee/Research-Literature-Hub/main/official/Luo2024Real-time.md

### Oh2024Enhancing
- Title: Enhancing active noise control of road noise using deep neural network to update secondary path estimate in real time
- Year: 2024
- Venue: Mechanical Systems and Signal Processing
- Publication type: journal-paper
- Primary domain: active-noise-control
- Domains: active-noise-control, machine-learning-audio
- Tags: active-noise-control, secondary-path-estimation, deep-neural-network, real-time-update, principal-component-analysis
- Team weight: unrated
- Summary: This paper introduces a novel deep learning-based approach to enhance active noise control (ANC) performance in vehicles by enabling real-time updates of the secondary path estimate. The dynamic nature of vehicle environments causes significant variations in the secondary path, degrading ANC effectiveness. The authors identified key spatial conditions (vertical, horizontal, roll, yaw) influencing these variations an…
- Key related papers:
  - [foundation] Advances in active noise control: A survey, with emphasis on recent nonlinear techniques (2013, DOI: 10.1016/j.sigpro.2012.08.013) - Provides a broad overview of active noise control techniques, setting the foundation for the problem addressed in the paper.
  - [foundation] Active noise control systems: algorithms and DSP implementations (2015, DOI: 10.1016/j.ymssp.2015.01.008) - Discusses fundamental algorithms like FxLMS, which are central to ANC systems and the context of this work.
  - [related_work] A review of virtual sensing algorithms for active noise control (2008, DOI: 10.3390/a1020069) - Introduces virtual sensing, a related concept to real-time path estimation for ANC in dynamic environments.
  - [related_work] Deep learning-based active noise control: A deep learning approach to active noise control (2021, DOI: 10.1016/j.neunet.2021.03.037) - Represents prior work applying deep learning to ANC, though not specifically for real-time secondary path estimation in vehicles.
  - [related_work] Deep learning-assisted active noise control in a time-varying environment (2023, DOI: 10.1007/s12206-023-0206-2) - Explores deep learning for ANC in time-varying environments, similar to the dynamic conditions addressed in this paper.
- Record: https://raw.githubusercontent.com/yzyzieee/Research-Literature-Hub/main/official/Oh2024Enhancing.md

### Wang2024Transferable
- Title: Transferable Selective Virtual Sensing Active Noise Control Technique Based on Metric Learning
- Year: 2024
- Venue: IEEE/ACM Transactions on Audio, Speech, and Language Processing
- Publication type: journal-paper
- Primary domain: active-noise-control
- Domains: active-noise-control, machine-learning-audio
- Tags: virtual-sensing, auxiliary-filter, metric-learning, convolutional-neural-network, transfer-learning
- Team weight: unrated
- Summary: This paper introduces a novel Transferable Selective Virtual Sensing (VS) Active Noise Control (ANC) technique that leverages metric learning to enhance the transferability of Convolutional Neural Network (CNN)-based VS systems. The core innovation is a pre-trained CNN feature extraction module that can be applied to new ANC systems without retraining, enabling it to handle unseen noise types. This approach signific…
- Key related papers:
  - [foundation] Selective virtual sensing technique for multi-channel feed-forward active noise control systems (2019, DOI: 10.1109/ICASSP.2019.8683940) - Introduces the selective virtual sensing technique which is a precursor to the proposed method.
  - [related_work] Cognitive virtual sensing technique for feedforward active noise control (2024, DOI: 10.1109/ICASSP48709.2024.10447397) - Presents a related CNN-based approach for virtual sensing that the proposed method builds upon and aims to improve.
  - [foundation] Transferable latent of cnn-based selective fixed-filter active noise control (2023, DOI: 10.1109/TASLP.2023.3275859) - This work demonstrates the transferability of CNN models in a related ANC context, providing motivation and a foundation for the proposed transferable approach.
  - [foundation] Distance metric learning: A comprehensive survey (2006) - Provides a foundational overview of metric learning, a core technology used in the proposed method.
  - [foundation] Metric learning: A survey (2013) - Offers a comprehensive survey of metric learning techniques, relevant to understanding the theoretical underpinnings of the proposed approach.
  - [method] Deep residual learning for image recognition (2016, DOI: 10.1109/CVPR.2016.90) - Introduces residual learning, which is incorporated into the CNN architecture used in the proposed method.
- Record: https://raw.githubusercontent.com/yzyzieee/Research-Literature-Hub/main/official/Wang2024Transferable.md

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
