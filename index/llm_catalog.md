# Research Literature Hub — LLM Catalog

Use this file as the entry point for searching our internal literature library.
Search this catalog first, then open only the most relevant literature record files.
Do not assume private Google Drive PDFs are accessible.

Papers: 3

## Papers

### Zhang2018Active
- Title: Active Noise Control Over Space: A Wave Domain Approach
- Year: 2018
- Venue: IEEE/ACM Transactions on Audio, Speech, and Language Processing
- Publication type: journal-paper
- Primary domain: active-noise-control
- Domains: active-noise-control, beamforming-arrays, room-acoustics
- Tags: active-noise-control, wave-domain, spatial-noise, multichannel, reverberant-room
- Team weight: unrated
- Summary: This paper develops four adaptive wave-domain active noise control algorithms for reducing a noise field over an extended spatial region. It compares modal-coefficient and acoustic-energy objectives, each implemented through either direct loudspeaker-weight updates or secondary-field modal updates. Simulations show faster convergence and better regional attenuation than conventional multi-point control, especially w…
- Key related papers:
  - [survey] Recent advances in active noise control inside automobile cabins: Toward quieter cars (2016) - Reviews spatial ANC challenges and practical vehicle-cabin applications that motivate regional control.
  - [survey] Recent advances on active noise control: Open issues and innovative applications (2012) - Provides the broader ANC background and open problems behind spatial noise control.
  - [method] Multichannel active noise control for spatially sparse noise fields (2016) - Introduces closely related spatial multichannel control ideas developed by the same research group.
  - [foundation] Noise cancellation over spatial regions using adaptive wave domain processing (2015) - Presents the earlier adaptive wave-domain formulation extended in this paper.
  - [foundation] Efficient massive multichannel active noise control using wave-domain adaptive filtering (2008) - Establishes a wave-domain adaptive filtering baseline for massive multichannel ANC.
  - [method] Theory and design of sound field reproduction in reverberant rooms (2005) - Supplies sound-field representation theory relevant to the reverberant-room formulation.
- Record: https://raw.githubusercontent.com/yzyzieee/Research-Literature-Hub/main/official/Zhang2018Active.md

### widrow1975adaptive
- Title: Adaptive noise cancelling: principles and applications
- Year: 1975
- Venue: Proceedings of the IEEE
- Publication type: journal-paper
- Primary domain: active-noise-control
- Domains: active-noise-control, fundamentals-dsp
- Tags: anc, adaptive-filter, lms
- Team weight: 60
- Summary: This foundational paper presents adaptive noise cancelling as a general estimation problem: a reference input correlated with unwanted interference is adaptively filtered and subtracted from the primary input. The LMS algorithm drives the filter toward the Wiener solution without requiring prior knowledge of signal statistics.
- Record: https://raw.githubusercontent.com/yzyzieee/Research-Literature-Hub/main/official/widrow1975adaptive.md

### xiao2026robust
- Title: Robust Soft-Constrained Spatially Selective Active Noise Control for Hearables Under Secondary Path Variations
- Year: 2026
- Venue: arXiv
- Publication type: preprint
- Primary domain: active-noise-control
- Domains: active-noise-control, spatial-audio
- Tags: anc, spatially-selective-anc, secondary-path, robust-optimization, hearables
- Team weight: unrated
- Summary: This paper addresses secondary-path variation in spatially selective active noise control for hearables. It computes one soft-constrained controller by averaging the optimization objective over a set of measured secondary-path estimates. Simulations and real-time experiments show that the robust controller gives up a small amount of matched-path performance in exchange for substantially more consistent behavior acro…
- Key related papers:
  - [baseline] Spatially Selective Active Noise Control for Open-Fitting Hearables with Acausal Optimization (2025, DOI: 10.61782/fa.2025.0817) - Provides the acausal SSANC controller that the robust formulation extends under path variation.
  - [method] Soft-constrained spatially selective active noise control for open-fitting hearables (2025) - Introduces the soft-constrained objective used as the basis of the robust average-cost design.
  - [foundation] Spatially selective active noise control systems (2023) - Establishes the direction-selective ANC problem and core system formulation.
  - [related_work] Data-driven uncertainty modeling for robust feedback active noise control in headphones (2024) - Provides a related data-driven treatment of acoustic-path uncertainty for headphone ANC.
  - [method] Robust single- and multi-loudspeaker least-squares-based equalization for hearing devices (2022) - Demonstrates robust optimization across measured hearing-device transfer-function variation.
- Record: https://raw.githubusercontent.com/yzyzieee/Research-Literature-Hub/main/official/xiao2026robust.md
