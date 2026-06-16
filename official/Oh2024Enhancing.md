---
title: >-
  Enhancing active noise control of road noise using deep neural network to
  update secondary path estimate in real time
entry_type: literature
publication_type: journal-paper
primary_domain: active-noise-control
domains:
  - active-noise-control
  - machine-learning-audio
venue: Mechanical Systems and Signal Processing
doi: 10.1016/j.ymssp.2023.110940
abstract: >-
  The performance of active noise control (ANC) is significantly influenced by
  the accuracy of the secondary path estimate. In the case of a vehicle, dynamic
  environments, which constantly change the secondary path, can degrade the ANC
  performance. To address this issue, we proposed a deep learning-based method
  to continuously update the secondary path estimate in real time. The
  sensitivity of secondary paths to various conditions was analyzed, with
  vertical, horizontal, roll, and yaw conditions identified as primary factors;
  subsequently, a dataset corresponding to these conditions was created.
  Estimation models were formulated using Delaunay triangulation- based
  interpolation and three deep neural network (DNN)-based methods which
  incorporated diverse representations of the secondary path domain. All the
  methods precisely estimated the secondary path under different conditions.
  Notably, DNN-based methods required significantly less data storage than the
  interpolation method, with the principal component analysis (PCA)- based
  approach performing the best, achieving a 98.5 % reduction. Using this method,
  updating the secondary path estimate in real time led to reductions of 10.2
  and 17.2 dB in road noise and 500 – 1,000 Hz random noise, respectively. The
  improvement was notable for both types of noises, indicating that the
  suggested method can expand the frequency range of ANC.
status: official
citation_key: Oh2024Enhancing
authors:
  - Jun Young Oh
  - Hyun Woo Jung
  - Myung Han Lee
  - Kyoung Hoon Lee
  - Yeon June Kang
year: 2024
tags:
  - active-noise-control
  - secondary-path-estimation
  - deep-neural-network
  - real-time-update
  - principal-component-analysis
key_references:
- title: 'Advances in active noise control: A survey, with emphasis on recent nonlinear techniques'
  doi: 10.1016/j.sigpro.2012.08.013
  year: 2013
  role: foundation
  reason: Provides a broad overview of active noise control techniques, setting the foundation for the problem addressed in the paper.
  status: external
  linked_card: null
- title: 'Active noise control systems: algorithms and DSP implementations'
  doi: 10.1016/j.ymssp.2015.01.008
  year: 2015
  role: foundation
  reason: Discusses fundamental algorithms like FxLMS, which are central to ANC systems and the context of this work.
  status: external
  linked_card: null
- title: A review of virtual sensing algorithms for active noise control
  doi: 10.3390/a1020069
  year: 2008
  role: related_work
  reason: Introduces virtual sensing, a related concept to real-time path estimation for ANC in dynamic environments.
  status: external
  linked_card: null
- title: 'Deep learning-based active noise control: A deep learning approach to active noise control'
  doi: 10.1016/j.neunet.2021.03.037
  year: 2021
  role: related_work
  reason: Represents prior work applying deep learning to ANC, though not specifically for real-time secondary path estimation in vehicles.
  status: external
  linked_card: null
- title: Deep learning-assisted active noise control in a time-varying environment
  doi: 10.1007/s12206-023-0206-2
  year: 2023
  role: related_work
  reason: Explores deep learning for ANC in time-varying environments, similar to the dynamic conditions addressed in this paper.
  status: in_library
  linked_card: Im2023Deep
key_figure:
  status: cached
  figure_id: Fig. 11
  page: 10
  role: system_setup
  caption: >-
    Experimental hardware setup for conducting ANC: (a) overall, (b) control
    system, (c) front seat, (d) rear seat.
  reason: >-
    Illustrates the practical implementation of the ANC system and experimental
    environment used for validation.
  image_ref: 1ZFWb-xkqseysr-Up3gBC_0Ug2weg27Jy
  image_private: true
drive:
  - >-
    https://drive.google.com/file/d/15MKFyDyhyMSXCMxbesu20RzVUc89_mpZ/view?usp=drivesdk
related: []
created: '2026-06-15'
reviewed_by: []
rating: null
ratings: []
comments: []
uploaded_by: YZY
uploaded_at: '2026-06-15T19:14:12.683Z'
pdf_uploaded_by: YZY
pdf_uploaded_at: '2026-06-15T19:12:33.644Z'
pdf_file_name: 0010_Oh2024Enhancing.pdf
pdf_reused: false
activity:
  - action: pdf_uploaded
    by: YZY
    at: '2026-06-15T19:12:33.644Z'
    detail: 0010_Oh2024Enhancing.pdf
  - action: card_published
    by: YZY
    at: '2026-06-15T19:14:12.683Z'
---
## Summary
This paper introduces a novel deep learning-based approach to enhance active noise control (ANC) performance in vehicles by enabling real-time updates of the secondary path estimate. The dynamic nature of vehicle environments causes significant variations in the secondary path, degrading ANC effectiveness. The authors identified key spatial conditions (vertical, horizontal, roll, yaw) influencing these variations and created a dataset to train estimation models. They compared Delaunay triangulation-based interpolation with three deep neural network (DNN) methods, including one based on Principal Component Analysis (PCA). The PCA-based DNN approach demonstrated superior performance, achieving a 98.5% reduction in data storage compared to interpolation while maintaining high estimation accuracy. Experimental validation showed that real-time secondary path updates using this method reduced road noise by 10.2 dB and random noise (500-1000 Hz) by 17.2 dB, indicating its potential to expand the effective frequency range of ANC systems.

## Problem
The performance of active noise control (ANC) systems, particularly in dynamic environments like vehicle cabins, is highly sensitive to the accuracy of the secondary path estimate. Conventional ANC methods, such as the filtered-x least mean square (FxLMS) algorithm, rely on an accurate model of the transfer function between the secondary loudspeaker and the error microphone. In vehicles, factors like passenger head movements, changes in seating position, and vehicle dynamics cause the secondary path to vary continuously. This variation leads to a mismatch between the estimated and actual secondary path, significantly degrading the ANC's noise cancellation effectiveness, especially at higher frequencies. Existing methods for online secondary path modeling often have limitations in handling complex spatial variations or require substantial computational resources and data storage.

## Method
The proposed method enhances ANC by continuously updating the secondary path estimate in real time using a pretrained deep neural network (DNN). The core of the approach involves:

1.  **Secondary Path Analysis and Dataset Creation:** The study first identified key factors influencing the secondary path in a vehicle, focusing on four spatial conditions: vertical, horizontal, roll, and yaw. A dataset was constructed by measuring secondary paths under 1,225 variations of these conditions. The data was filtered to a relevant frequency band (20-1000 Hz) and downsampled to 5,120 Hz for ANC application.

2.  **Secondary Path Estimation Methods:**
    *   **Delaunay Triangulation Interpolation:** This method estimates the secondary path for a target condition by interpolating the paths of surrounding measured conditions, forming a pentahedron in a 4D space. The secondary path $C_t$ for a target condition is represented as a linear combination of surrounding conditions $C_i$: $C_t = \sum_{i=1}^{5} w_i C_i$, where $w_i$ are interpolation weights satisfying $\sum_{i=1}^{5} w_i = 1$. This method requires storing a large number of secondary path measurements (220,500 numbers for 1,225 cases).
    *   **Deep Neural Network (DNN) Methods:** Three DNN-based approaches were explored:
        *   **Time Domain:** The secondary path is represented directly in the time domain. This requires a large number of output nodes and consequently many parameters, leading to significant data storage needs (e.g., 47,740 data points for (40,180) hidden layers).
        *   **Frequency Domain:** The secondary path is converted to the frequency domain, reducing the number of parameters needed for representation (e.g., 18 real and 18 imaginary values for <1000 Hz). This approach requires less storage than the time domain (e.g., 5,688 data points for (36,36) hidden layers).
        *   **Principal Component Analysis (PCA) Domain:** PCA is used to find common basis vectors for the secondary paths. Each secondary path is then reconstructed as a linear combination of these basis vectors. The DNN is trained to predict the weights for these basis vectors. This method significantly reduces the number of parameters to be stored (e.g., 3,260 data points for ten basis vectors) and achieves high accuracy. The PCA-based method demonstrated the best performance, requiring minimal data storage (up to 98.5% reduction compared to interpolation) and fast estimation times (~72 μs).

3.  **Real-time Update Integration:** A pretrained DNN model (specifically the PCA-based one) is used in real time. When the vehicle environment changes (e.g., head movement detected via a camera and Aruco marker), the current spatial conditions are fed into the DNN to generate an updated secondary path estimate. This estimate is then used by the FxLMS algorithm to adapt the adaptive filter $W(z)$. The adaptive filter update rule is $w(n+1) = w(n) + \mu e(n) x'(n)$, where $e(n)$ is the error signal and $x'(n)$ is the filtered reference signal.

4.  **Experimental Validation:** The effectiveness of the real-time update method was validated using two noise sources: recorded road noise and 500-1000 Hz random noise. Experiments compared ANC performance with and without real-time secondary path updates, demonstrating significant noise reduction improvements (10.2 dB for road noise, 17.2 dB for random noise) when updates were applied.

## Key results
*   Four spatial conditions (vertical, horizontal, roll, yaw) were identified as the primary factors influencing secondary path variations in a vehicle.
*   A dataset of 1,225 secondary path measurements was created based on these spatial conditions.
*   DNN-based methods, particularly the PCA-based approach, significantly reduced data storage requirements for secondary path representation compared to Delaunay triangulation interpolation (up to 98.5% reduction).
*   The PCA-based DNN method achieved high estimation accuracy with minimal storage needs and fast real-time estimation (~72 μs).
*   Real-time updates of the secondary path estimate using the PCA-based DNN method led to substantial ANC performance improvements: 10.2 dB reduction for road noise and 17.2 dB reduction for 500-1000 Hz random noise.
*   The performance improvement was more pronounced at higher frequencies, suggesting the method's utility in expanding the effective frequency range of ANC.

## Strengths
*   **Real-time Adaptability:** The core strength is the ability to continuously update the secondary path estimate in real time, crucial for dynamic environments like vehicles.
*   **Data Storage Efficiency:** The PCA-based DNN approach drastically reduces the storage required for secondary path models, making it practical for embedded systems.
*   **High Accuracy:** The method achieves precise secondary path estimation, leading to significant improvements in ANC performance.
*   **Low Computational Cost:** The DNN inference is computationally efficient, enabling real-time application.
*   **No Additional Equipment:** Unlike some prior methods, it does not require users to wear extra sensors or equipment.
*   **Potential for Frequency Range Expansion:** The improved performance at higher frequencies suggests it can extend the operational bandwidth of ANC systems.

## Limitations
*   **Dataset Dependency:** The performance relies on the quality and comprehensiveness of the training dataset, which needs to cover relevant environmental variations.
*   **Generalization:** While tested on road and random noise, generalization to all possible vehicle noise scenarios and extreme environmental conditions might require further validation.
*   **DNN Model Complexity:** While PCA reduces parameters, the initial DNN training and selection of optimal hidden layer dimensions still require careful consideration.
*   **Hardware Integration:** The paper focuses on the algorithm; practical implementation on specific automotive hardware might present challenges.

## Relevance to our group
This research is highly relevant to our group's interests in advanced audio signal processing, particularly in the areas of active noise control and adaptive filtering. The application of deep learning for real-time system adaptation in challenging acoustic environments aligns with our focus on intelligent audio solutions. Specifically, the techniques for efficient secondary path modeling and real-time updates are directly applicable to improving the performance of ANC systems in various contexts, including automotive, aerospace, and personal audio devices. The PCA-based DNN approach offers a promising direction for reducing computational and storage burdens in embedded ANC systems, which is a key challenge for practical deployment.

## Notes
The authors used a bandpass filter (20-1000 Hz) for the secondary path analysis. This choice was motivated by the frequency content of road noise, the need to avoid high-frequency hardware limitations, and to simplify the path's shape for better estimation. The study focused on the left ear position for experimental results due to its higher sensitivity to spatial conditions. Future work aims to address multi-microphone/loudspeaker scenarios, real driving conditions, and the use of acceleration signals as references.
