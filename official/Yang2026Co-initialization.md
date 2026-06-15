---
title: >-
  Co-initialization of Control Filter and Secondary Path via Meta-Learning for
  Active Noise Control
entry_type: literature
publication_type: conference-paper
primary_domain: active-noise-control
domains:
  - active-noise-control
  - machine-learning-audio
venue: ICASSP
doi: 10.1109/ICASSP55912.2026.11463219
abstract: >-
  Active noise control (ANC) must adapt quickly when the acoustic environment
  changes, yet early performance is largely dictated by initialization. We
  address this with a Model-Agnostic Meta-Learning (MAML) co-initialization that
  jointly sets the control filter and the secondary-path model for FxLMS-based
  ANC while keeping the runtime algorithm unchanged. The initializer is
  pre-trained on a small set of measured paths using short two-phase inner loops
  that mimic identification followed by residual-noise reduction, and is applied
  by simply setting the learned initial coefficients. In an online secondary
  path modeling FxLMS testbed, it yields lower early-stage error, shorter
  time-to-target, reduced auxiliary-noise energy, and faster recovery after path
  changes than a baseline without re-initialization. The method provides a
  simple fast start for feedforward ANC under environment changes, requiring a
  small set of paths to pre-train.
status: official
citation_key: Yang2026Co-initialization
authors:
  - Ziyi Yang
  - Li Rao
  - Zhengding Luo
  - Dongyuan Shi
  - Qirui Huang
  - Woon-Seng Gan
year: 2026
tags:
  - active-noise-control
  - fxlms
  - secondary-path-modeling
  - model-agnostic-meta-learning
  - few-shot-learning
  - initialization
key_references:
  - title: >-
      Online secondary path modeling in active noise control without auxiliary
      noise
    doi: 10.1121/1.5121395
    year: 2019
    role: related_work
    reason: >-
      This paper explores online secondary path modeling, a core component
      addressed by the proposed initialization method.
    status: external
    linked_card: null
  - title: Model-agnostic meta-learning for fast adaptation of deep networks
    doi: 10.48550/arXiv.1703.03400
    year: 2017
    role: foundation
    reason: >-
      This is the foundational paper for Model-Agnostic Meta-Learning (MAML),
      the core meta-learning technique used in this work.
    status: external
    linked_card: null
  - title: >-
      Fast adaptive active noise control based on modified model-agnostic
      meta-learning algorithm
    doi: 10.1109/LSP.2020.3044781
    year: 2021
    role: related_work
    reason: >-
      This prior work also applies MAML to ANC, but focuses on initializing only
      the control filter, whereas this paper co-initializes both.
    status: external
    linked_card: null
  - title: >-
      On comparison of online secondary path modeling methods with auxiliary
      noise
    doi: 10.1109/TSA.2005.853910
    year: 2005
    role: foundation
    reason: >-
      This paper provides a foundational comparison of online secondary path
      modeling methods, which is the context for the proposed initialization.
    status: external
    linked_card: null
  - title: Acoustic path database for ANC in-ear headphone development
    doi: 10.20382/RWT01386
    year: 2019
    role: dataset
    reason: >-
      This paper provides the measured acoustic paths used for training and
      evaluation in the proposed method.
    status: external
    linked_card: null
key_figure:
  status: cached
  figure_id: Figure 2
  page: 4
  role: main_result
  caption: >-
    Online modeling FxLMS with auxiliary-noise power (paths switch at t=60 s &
    t=120 s).
  reason: >-
    This figure visually demonstrates the core performance improvement of the
    proposed MAML co-initialization, showing lower MSE and reduced auxiliary
    noise power after path switches compared to the baseline.
  image_ref: 1hzq2b6oCKy8JJlI1EXqTCdkPNjz4eqNT
  image_private: true
drive:
  - >-
    https://drive.google.com/file/d/10RSFYhzN8g2BIieqMmn3zgWsx44dzuJ-/view?usp=drivesdk
related: []
created: '2026-06-15'
reviewed_by: []
rating: null
ratings: []
comments: []
uploaded_by: YZY
uploaded_at: '2026-06-15T13:49:03.124Z'
pdf_uploaded_by: YZY
pdf_uploaded_at: '2026-06-15T13:46:25.337Z'
pdf_file_name: 0009_Yang2026Co-initialization.pdf
pdf_reused: false
activity:
  - action: pdf_uploaded
    by: YZY
    at: '2026-06-15T13:46:25.337Z'
    detail: 0009_Yang2026Co-initialization.pdf
  - action: card_published
    by: YZY
    at: '2026-06-15T13:49:03.124Z'
---
## Summary
This paper introduces a novel Model-Agnostic Meta-Learning (MAML) based co-initialization strategy for Feedforward Filtered-x Least Mean Squares (FxLMS) active noise control (ANC) systems. The primary goal is to improve the initial performance and adaptation speed of ANC systems when the acoustic environment changes. Unlike previous methods that might initialize only the control filter or rely on standard FxLMS with zero initialization, this approach jointly learns initial values for both the control filter and the secondary path model. This initializer is pre-trained on a small dataset of measured acoustic paths using a two-phase inner loop that simulates secondary path identification and subsequent noise reduction. When deployed, the learned initial coefficients are simply set, and the runtime adaptive updates of the FxLMS algorithm remain unchanged. Experimental results on an online secondary path modeling (OSPM) FxLMS testbed demonstrate that the proposed co-initialization leads to lower early-stage error, faster convergence to the target performance, reduced auxiliary noise energy, and quicker recovery after abrupt changes in the acoustic environment compared to a baseline without re-initialization. The study also highlights that the diversity of the training paths, particularly the secondary path diversity, significantly impacts the effectiveness of the meta-learned initializer.

## Problem
Active noise control (ANC) systems, particularly those based on the FxLMS algorithm, are sensitive to the accuracy of their initialization. Both the control filter and the model of the secondary acoustic path significantly influence the system's initial performance. When the acoustic environment changes, existing FxLMS systems often struggle with slow convergence and suboptimal performance during the initial adaptation phase. While online secondary path modeling (OSPM) techniques exist to adapt to environmental changes, they often require injecting auxiliary noise, which can be low-power and lead to noisy gradient estimates, further slowing down adaptation. Current approaches typically initialize the control filter to zero or nominal values and may not adequately address the joint initialization of both the control filter and the secondary path model, especially for fast adaptation after abrupt environmental shifts.

## Method
The proposed method employs Model-Agnostic Meta-Learning (MAML) to jointly learn initializations for the control filter ($w$) and the secondary path model ($\hat{s}$) in an FxLMS-based ANC system. Each acoustic condition is treated as a task during meta-training, where the secondary path ($s$) is known. The meta-parameters to be learned are the initial control filter coefficients $\Phi \in \mathbb{R}^{L_w}$ and the initial secondary path model coefficients $\Psi \in \mathbb{R}^{L_s}$.

The meta-training process involves an inner loop and an outer loop.

**Inner Loop (Training per Task):**
1.  **Initialization:** For a given task (acoustic condition), the adaptive filters are initialized with the current meta-parameters: $w \leftarrow \Phi$ and $\hat{s} \leftarrow \Psi$.
2.  **Phase A: Secondary Path Update:** Using a sampled segment of reference signal $x(n)$ and disturbance $d(n)$, and injecting auxiliary noise $v(n)$, the secondary path model $\hat{s}$ is updated for $T_A$ steps. The identification output is $y_{id}(n) = s^\top u(n)$, where $u(n)$ is derived from the auxiliary noise. The error is $e_s(n) = y_{id}(n) - \hat{s}^\top u(n)$, and $\hat{s}$ is updated via LMS: $\hat{s}(t+1) = \hat{s}(t) + \mu_s e_s(t) u(t)$.
3.  **Phase B: Control Filter Update:** Using the updated $\hat{s}$, the filtered reference $\tilde{x}(n) = \hat{s}^\top x_s(n)$ is computed. The control filter $w$ is then updated for $T_B$ steps using the FxLMS recursion: $e(m) = d(m) - w^\top x'(m)$, where $x'(m)$ is the regressor for $w$. The update is $w(t+1) = w(t) + \mu_w e(t) x'(t)$.

**Inner Loop (Testing/Validation):**
After the training phases, the updated $\hat{s}$ and $w$ are frozen. Validation is performed on a separate segment of the same task using the true secondary path $s$ to compute validation errors $e_s^{\dagger}(k)$ and $e^{\dagger}(k)$. These errors are used to compute meta-gradients $\Delta\Psi$ and $\Delta\Phi$ using forgetting factors $\lambda_s, \lambda_w$: 
$$ \Delta\Psi = \sum_{t_s=0}^{N_s-1} \lambda^{t_s} s e_s^{\dagger}(n-t_s) u^{\dagger}(n-t_s) $$ 
$$ \Delta\Phi = \sum_{t_w=0}^{N_w-1} \lambda^{t_w} w e^{\dagger}(n-t_w) x'^{\dagger}(n-t_w) $$ 

**Outer Loop (Across-Task MAML Update):**
The meta-parameters are updated simultaneously using the computed meta-gradients and meta-learning rates $\alpha_w, \alpha_s$: 
$$ \Phi(i+1) = \Phi(i) + \alpha_w \Delta\Phi $$ 
$$ \Psi(i+1) = \Psi(i) + \alpha_s \Delta\Psi $$ 
This process is repeated over many tasks (acoustic conditions) to obtain a robust co-initialization $(\Phi, \Psi)$ that enables fast adaptation in few-shot scenarios.

For online deployment with OSPM-FxLMS, the learned $(\Phi, \Psi)$ are used to initialize $w$ and $\hat{s}$ at the start or after an environment change is detected. The adaptive updates (Equations 3-5 in the paper) then proceed as usual.

## Key results
The proposed MAML co-initialization method was evaluated on an OSPM-FxLMS testbed using measured in-ear headphone paths. Key findings include:

*   **Improved Early-Stage Performance:** The MAML-initialized system exhibited lower early-stage residual error compared to a baseline without re-initialization.
*   **Faster Convergence:** The system reached the target error level more quickly after initialization or after an acoustic environment switch.
*   **Reduced Auxiliary Noise:** The amount of auxiliary noise required for secondary path identification was reduced, leading to less injected noise energy.
*   **Faster Recovery:** After abrupt changes in the acoustic environment (simulated by switching paths), the MAML-initialized system recovered its performance significantly faster than the baseline.
*   **Effect of Training Data Diversity:** A study on training set diversity revealed that increased path diversity, particularly in the secondary paths, leads to a better-performing initializer. This suggests prioritizing varied secondary path measurements when creating meta-training datasets.

## Strengths
*   **Joint Initialization:** The method jointly initializes both the control filter and the secondary path model, addressing a critical aspect of ANC system performance that is often overlooked.
*   **Fast Adaptation:** It significantly speeds up the initial convergence and adaptation after environmental changes, crucial for real-world ANC applications.
*   **No Runtime Modification:** The core FxLMS adaptive update rules remain unchanged, making it easy to integrate into existing FxLMS-based ANC systems.
*   **Few-Shot Learning:** The meta-learning approach allows for effective initialization with a small set of training paths.
*   **Data-Driven Improvement:** Leverages meta-learning to learn optimal starting points from data, adapting to the statistical properties of acoustic environments.

## Limitations
*   **Meta-Training Requirement:** The method requires a pre-training phase on a dataset of acoustic paths, which needs to be representative of the expected operating environments.
*   **Sensitivity to Training Data:** The performance of the initializer is dependent on the diversity and representativeness of the training paths, particularly the secondary paths.
*   **Computational Overhead:** While runtime adaptation is unchanged, the meta-training process itself can be computationally intensive.
*   **Auxiliary Noise Still Needed:** Although reduced, auxiliary noise is still used during the online adaptation phase for secondary path modeling.

## Relevance to our group
This research is highly relevant to our group's focus on advanced signal processing for audio applications, particularly in the domain of active noise control. The proposed meta-learning approach for co-initialization directly addresses the critical challenge of rapid adaptation in dynamic acoustic environments, a common issue in practical ANC systems. Understanding and improving initialization strategies is key to enhancing the performance and user experience of ANC devices. The findings on the importance of secondary path diversity also provide valuable insights for data collection and experimental design in our own ANC research. Furthermore, the integration of machine learning techniques like MAML into established signal processing frameworks like FxLMS aligns with our interest in exploring data-driven methods for audio signal enhancement and control.

## Notes
The authors provide code for their method, which could be valuable for replication and further experimentation. The study's emphasis on the impact of secondary path diversity offers a practical guideline for building effective meta-training datasets for ANC initialization. The method's ability to improve performance without altering the core FxLMS update rules makes it a promising plug-and-play enhancement for existing ANC systems.
