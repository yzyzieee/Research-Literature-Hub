---
title: >-
  Transferable Selective Virtual Sensing Active Noise Control Technique Based on
  Metric Learning
entry_type: literature
publication_type: journal-paper
primary_domain: active-noise-control
domains:
  - active-noise-control
  - machine-learning-audio
venue: 'IEEE/ACM Transactions on Audio, Speech, and Language Processing'
doi: ''
abstract: >-
  Virtual sensing (VS) technology enables active noise control (ANC) systems to
  attenuate noise at virtual locations distant from the physical error
  microphones. Appropriate auxiliary filters (AF) can significantly enhance the
  effectiveness of VS approaches. The selection of appropriate AF for various
  types of noise can be automatically achieved using convolutional neural
  networks (CNNs). However, training the CNN model for different ANC systems is
  often labour-intensive and time-consuming. To tackle this problem, we propose
  a novel method, Transferable Selective VS, by integrating metric-learning
  technology into CNN-based VS approaches. The Transferable Selective VS method
  allows a pre-trained CNN to be applied directly to new ANC systems without
  requiring retraining, and it can handle unseen noise types. Numerical
  simulations demonstrate the effectiveness of the proposed method in
  attenuating sudden-varying broadband noises and real-world noises.
status: official
citation_key: Wang2024Transferable
authors:
  - Boxiang Wang
  - Dongyuan Shi
  - Zhengding Luo
  - Xiaoyi Shen
  - Junwei Ji
  - Woon-Seng Gan
year: 2024
tags:
  - virtual-sensing
  - auxiliary-filter
  - metric-learning
  - convolutional-neural-network
  - transfer-learning
key_references:
  - title: >-
      Selective virtual sensing technique for multi-channel feed-forward active
      noise control systems
    doi: 10.1109/ICASSP.2019.8683940
    year: 2019
    role: foundation
    reason: >-
      Introduces the selective virtual sensing technique which is a precursor to
      the proposed method.
    status: external
    linked_card: null
  - title: Cognitive virtual sensing technique for feedforward active noise control
    doi: 10.1109/ICASSP48709.2024.10447397
    year: 2024
    role: related_work
    reason: >-
      Presents a related CNN-based approach for virtual sensing that the
      proposed method builds upon and aims to improve.
    status: external
    linked_card: null
  - title: >-
      Transferable latent of cnn-based selective fixed-filter active noise
      control
    doi: 10.1109/TASLP.2023.3275859
    year: 2023
    role: foundation
    reason: >-
      This work demonstrates the transferability of CNN models in a related ANC
      context, providing motivation and a foundation for the proposed
      transferable approach.
    status: external
    linked_card: null
  - title: 'Distance metric learning: A comprehensive survey'
    doi: ''
    year: 2006
    role: foundation
    reason: >-
      Provides a foundational overview of metric learning, a core technology
      used in the proposed method.
    status: external
    linked_card: null
  - title: 'Metric learning: A survey'
    doi: ''
    year: 2013
    role: foundation
    reason: >-
      Offers a comprehensive survey of metric learning techniques, relevant to
      understanding the theoretical underpinnings of the proposed approach.
    status: external
    linked_card: null
  - title: Deep residual learning for image recognition
    doi: 10.1109/CVPR.2016.90
    year: 2016
    role: method
    reason: >-
      Introduces residual learning, which is incorporated into the CNN
      architecture used in the proposed method.
    status: external
    linked_card: null
key_figure:
  status: cached
  figure_id: Fig. 2
  page: 3
  role: method_overview
  caption: >-
    Block diagram of (a) the proposed 1D CNN and (b) the classifier based on
    cosine similarity calculation, with each convolutional layer configured as
    (input channels, output channels, kernel size, and stride).
  reason: >-
    This figure clearly illustrates the architecture of the proposed 1D CNN and
    the cosine similarity-based classification mechanism, providing a good
    overview of the core methodology.
  image_ref: 1khlUVstjkqWGmzUqmmwB8uUWFC9L30fP
  image_private: true
drive:
  - >-
    https://drive.google.com/file/d/1N1BE0fHVLYGN4LOmSxWB4hUCSiMlxyaB/view?usp=drivesdk
related: []
created: '2026-06-16'
reviewed_by: []
rating: null
ratings: []
comments: []
uploaded_by: WBX
uploaded_at: '2026-06-16T09:48:20.080Z'
pdf_uploaded_by: WBX
pdf_uploaded_at: '2026-06-16T09:46:56.502Z'
pdf_file_name: 0014_Wang2024Transferable.pdf
pdf_reused: false
activity:
  - action: pdf_uploaded
    by: WBX
    at: '2026-06-16T09:46:56.502Z'
    detail: 0014_Wang2024Transferable.pdf
  - action: card_published
    by: WBX
    at: '2026-06-16T09:48:20.080Z'
---
## Summary
This paper introduces a novel Transferable Selective Virtual Sensing (VS) Active Noise Control (ANC) technique that leverages metric learning to enhance the transferability of Convolutional Neural Network (CNN)-based VS systems. The core innovation is a pre-trained CNN feature extraction module that can be applied to new ANC systems without retraining, enabling it to handle unseen noise types. This approach significantly reduces the labor and time required for training and deployment across different systems. Numerical simulations confirm the method's effectiveness in attenuating sudden-varying broadband and real-world noises, achieving performance close to optimal control.

## Problem
Traditional Active Noise Control (ANC) systems using virtual sensing (VS) face challenges when the acoustic environment or noise characteristics change between the filter tuning and control stages. While CNN-based VS techniques have improved adaptability by dynamically selecting auxiliary filters (AFs) based on noise type, they typically require retraining the CNN model for each new ANC system. This retraining process is time-consuming, data-intensive, and impractical for systems with limited noise samples. Furthermore, deploying these models across different systems with varying acoustic paths and noise types is a significant hurdle for widespread adoption.

## Method
The proposed Transferable Selective VS technique builds upon CNN-based selective VS by integrating metric learning to achieve model transferability. The method utilizes a pre-trained 1D CNN model, specifically its feature extraction module, as a classifier for new VS systems. This module is trained on a dataset of noise waveforms from an initial VS system to learn discriminative features. When applied to a new VS system, the feature extraction module processes incoming noise signals to generate an embedding code ($E_x$). Similarly, embedding codes ($E_q$) are generated for the AF training noises of the new system. The selection of the most appropriate AF is then determined by calculating the cosine similarity ($S_q$) between the embedding code of the incoming noise and the embedding codes of the AF training noises. The AF corresponding to the training noise with the highest cosine similarity is selected.

The mathematical formulation for selecting the AF is as follows:

1.  **Embedding Code Generation:** The feature extraction module of the pre-trained CNN, denoted as $CNN(	ext{·})$, generates an embedding code for the normalized reference signal $\hat{x}'(n)$:
    $E_x = CNN(\hat{x}'(n))$ (6)

    For the $q$-th normalized AF training noise $\eta_q$ in the new system, the embedding code is:
    $E_q = CNN(\eta_q)$, $q \in [1, Q]$ (7)

2.  **Cosine Similarity Calculation:** The cosine similarity between $E_x$ and $E_q$ is computed:
    $S_q = \frac{E_x^T \cdot E_q}{\max(||E_x||_2 \cdot ||E_q||_2, \alpha)}$, $q \in [1, Q]$ (8)
    where $\alpha$ is a small positive constant to prevent division by zero, and $|| \cdot ||_2$ denotes the L2 norm.

3.  **AF Selection:** The index $j$ of the selected AF is determined by finding the training noise that yields the maximum cosine similarity:
    $j = \text{argmax}_{q \in [1, Q]} \{S_q\}$ (9)

This approach avoids retraining the CNN for new systems by reusing the learned feature representations. The feature extraction module has significantly fewer parameters than the full CNN, making it computationally efficient and suitable for deployment on co-processors.

## Key results
The proposed Transferable Selective VS technique demonstrated strong performance in numerical simulations. In VS system II, the method achieved a noise classification accuracy of 92.6% for unseen noise classes, outperforming more complex CNN models like M34-res (36.6%) while using significantly fewer parameters (13K vs. 3986K). When applied to cancel varying broadband noise, the proposed method achieved noise reduction performance closely matching optimal control and significantly outperforming the conventional full-band AF and selective VS techniques. Similar results were observed for real-world noise cancellation, where the technique effectively reduced disturbances from genset and compressor noise, neither of which were part of the training set, again achieving performance comparable to optimal control.

## Strengths
The primary strength of this method is its enhanced transferability, allowing a pre-trained CNN model to be effectively used in new VS systems without retraining. This is achieved through metric learning and the reuse of a CNN's feature extraction module. The technique can handle unseen noise types, which is a significant advantage over traditional selective VS methods. The proposed CNN architecture is lightweight, requiring fewer parameters and computational resources, making it suitable for deployment on co-processors. The method demonstrates robust performance in attenuating both synthetic varying broadband noises and real-world noises.

## Limitations
The paper does not explicitly detail the limitations of the proposed method. However, potential limitations could include the performance degradation if the acoustic paths in the new system differ drastically from those in the training system, even if the noise types are similar. The effectiveness of cosine similarity as a distance metric might also be sensitive to the distribution of learned features. While the paper mentions handling unseen noise types, the extent of this capability for highly dissimilar noise characteristics is not fully explored.

## Relevance to our group
This research is highly relevant to our group's focus on advanced active noise control and signal processing techniques. The development of transferable machine learning models for ANC systems aligns with our interest in creating more adaptable and efficient noise reduction solutions. Specifically, the integration of metric learning for improved model generalization and the application of lightweight CNNs for deployment on embedded systems are areas of significant interest. The successful demonstration of noise cancellation for sudden-varying and real-world noises, including those not seen during training, directly addresses practical challenges in ANC applications.

## Notes
The code for the proposed method is available on GitHub, which is beneficial for reproducibility and further research. The paper highlights the computational efficiency of the feature extraction module, suggesting its suitability for real-time applications on resource-constrained devices.
