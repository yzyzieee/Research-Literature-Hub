---
title: "Robust Soft-Constrained Spatially Selective Active Noise Control for Hearables Under Secondary Path Variations"
entry_type: literature
primary_domain: active-noise-control
domains: [active-noise-control, spatial-audio]
publication_type: preprint
venue: arXiv
doi: 10.48550/arXiv.2605.17407
abstract: "A robust soft-constrained spatially selective ANC design averages its objective over measured secondary-path estimates. Simulations and real-time experiments show a narrower performance spread under path mismatch with a small reduction in mean performance."
status: official
citation_key: xiao2026robust
authors: ["Tong Xiao", "Reinhild Roden", "Matthias Blau", "Simon Doclo"]
year: 2026
tags: ["anc", "spatially-selective-anc", "secondary-path", "robust-optimization", "hearables"]
drive: ["https://drive.google.com/file/d/169kOYOzTtUgqYjPNuKq5fUHW2Si3_OLR/view?usp=drivesdk"]
related: []
created: 2026-06-13
reviewed_by: []
---
## Summary
This paper addresses the challenge of secondary path variations in spatially selective active noise control (SSANC) for hearables. SSANC aims to attenuate noise from specific directions while preserving desired speech. A key practical issue is that the acoustic path from the hearable's loudspeaker to the inner error microphone (the secondary path) can vary significantly between users and due to device fit. This variation can degrade SSANC performance and compromise system stability. The authors propose a robust soft-constrained optimization framework that computes a single control filter by minimizing the average cost over a set of secondary path estimates derived from human measurements. This approach aims to provide consistent performance even when the exact secondary path is unknown.

## Problem
*   **Problem:** Secondary path variations in hearables cause performance degradation and instability in SSANC systems.
*   **Goal:** Develop a robust SSANC framework that is resilient to these variations.
*   **Proposed Solution:** A robust soft-constrained optimization framework that minimizes the average cost over a set of secondary path estimates.
*   **Evaluation:** Simulations and real-time experiments were conducted.
*   **Results:** The proposed robust approach achieves slightly lower mean performance than the matched (oracle) case but significantly narrows the performance spread, leading to more consistent results across different secondary path conditions.

## Method
The paper builds upon a soft-constrained SSANC formulation that balances noise reduction and speech distortion. The standard SSANC objective is to minimize the power of the inner error microphone signal while preserving desired speech. This is achieved by minimizing a cost function that includes the expected squared error at the inner microphone, a regularization term to prevent loudspeaker overload, and a term penalizing speech distortion.

The core of the proposed method lies in adapting this cost function for robustness against secondary path variations. Instead of optimizing the control filter `w` for a single estimated secondary path `bG_j`, the robust approach minimizes the average cost over a set of `J` secondary path estimates `{bG_j}_{j=1}^J`:

`min_w (1/J) * sum_{j=1}^J [ E{e_j^2(n)} + mu * ||H(q + bG_j * w) - alpha * delta_Delta||^2 ] + w^T * B * w`

where `e_j(n)` is the error signal for the j-th path estimate, `mu` is the trade-off parameter between noise reduction and speech distortion, `H` represents relative impulse responses, `q` and `delta_Delta` are related to the desired speech signal, `alpha` is the speech amplification factor, and `B` is a regularization matrix.

The resulting robust control filter `w_robust` is derived by averaging the terms involving the secondary path estimates:

`w_robust = - (Phi_rr + mu * (1/J) * sum_{j=1}^J bG_j^T * H^T * H * bG_j)^-1 * [phi - mu * (1/J) * sum_{j=1}^J bG_j^T * H^T * (alpha * delta_Delta - Hq)]`

where `Phi_rr` and `phi` are also averaged terms incorporating the secondary path estimates.

Three evaluation cases were considered:
1.  **Matched Case (Oracle):** The control filter is optimized and evaluated using the true secondary path. This serves as an upper performance bound.
2.  **Mismatched Case:** A control filter is optimized for a single secondary path estimate and then evaluated on the remaining estimates. This highlights the performance degradation due to mismatch.
3.  **Robust Case:** The proposed robust filter is optimized using a set of secondary path estimates and evaluated across the same set. This demonstrates the improved consistency.

Performance was evaluated using metrics such as noise reduction (NR), intelligibility-weighted spectral distortion (SD intellig), Perceptual Evaluation of Speech Quality (PESQ), and Extended Short-Term Objective Intelligibility (ESTOI).

## Key results
Simulations and real-time experiments demonstrated that:
*   The **matched case** achieved the best mean performance across all metrics but had a narrow performance spread.
*   The **mismatched case** showed a significantly wider performance range, especially for noise reduction (up to 6 dB spread in the 5th-95th percentile), indicating substantial performance variability.
*   The **proposed robust case** achieved mean performance slightly below the matched case but comparable to the mismatched case. Crucially, it substantially narrowed the performance spread (5th-95th percentile range), providing more consistent and reliable performance across various secondary path conditions.
*   Spectra of speech and noise components at the error microphones confirmed the simulation findings, showing good agreement between simulated and experimental results for both matched and robust cases.

## Strengths

The work targets a practical source of deployment failure and evaluates robustness using both simulations and real-time experiments. Reporting performance distributions rather than only mean values makes the consistency gain visible.

## Limitations

The robust filter depends on how representative the secondary-path set is of future users and fits. The average-cost formulation may not protect against rare worst-case paths, and the trade-off between mean performance and spread requires application-specific tuning.

## Relevance to our group
The paper presents a practical solution to a common problem in hearable ANC: the variability of the secondary path. The robust optimization approach, by averaging over a set of path estimates, effectively smooths out the performance fluctuations that occur when a filter is optimized for a single, potentially inaccurate, path. This is particularly valuable for hearables where individual fitting and ear canal acoustics lead to significant path variations. The use of human measurement-derived spectral variations to model these paths adds to the practical relevance. The experimental validation on a real-time platform is a strong point, confirming the simulation results. The trade-off between slightly reduced mean performance and significantly improved robustness is a key takeaway, suggesting this approach is well-suited for real-world hearable applications.

## Notes

Compare average-cost robustness with worst-case and distributionally robust formulations before selecting a controller for deployment.

## References
[1] S. M. Kuo and D. R. Morgan, Active noise control systems: Algorithms and DSP implementations. Wiley, 1996.
[2] S. J. Elliott, Signal processing for active control. Academic Press, 2000.
[3] C. Hansen, S. Snyder, X. Qiu, L. Brooks, and D. Moreau, Active control of noise and vibration, 2nd ed. CRC Press, Nov. 2012.
[4] P. R. Benois, R. Roden, M. Blau, and S. Doclo, “Optimization of a fixed virtual sensing feedback ANC controller for in-ear headphones with multiple loudspeakers,” in Proc. IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), Singapore, 2022, pp. 8717–8721.
[5] F. Hilgemann, E. Chatzimoustafa, and P. Jax, “Data-driven uncertainty modeling for robust feedback active noise control in headphones,” Journal of the Audio Engineering Society, vol. 72, no. 12, pp. 873–883, Apr 2024.
[6] C.-Y. Chang, A. Siswanto, C.-Y. Ho, T.-K. Yeh, Y.-R. Chen, and S. M. Kuo, “Listening in a noisy environment: Integration of active noise control in audio products,” IEEE Consumer Electronics Magazine, vol. 5, no. 4, pp. 34–43, 2016.
[7] R. Gupta, J. He, R. Ranjan, W.-S. Gan, F. Klein, C. Schnei- derwind, A. Neidhardt, K. Brandenburg, and V. Väl- imäki, “Augmented/mixed reality audio for hearables: Sensing, control, and rendering,” IEEE Signal Processing Magazine, vol. 39, no. 3, pp. 63–89, 2022.
[8] R. Serizel, M. Moonen, J. Wouters, and S. H. Jensen, “Integrated active noise control and noise reduction in hearing aids,” IEEE Transactions on Audio, Speech, and Language Processing, vol. 18, no. 6, pp. 1137–1146, 2010.
[9] D. Dalga and S. Doclo, “Influence of secondary path estimation errors on the performance of ANC-motivated noise reduction algorithms for hearing aids,” in Proc. IEEE Workshop on Applications of Signal Processing to Audio and Acoustics (WASPAA), New Paltz, USA, 2013, pp. 1–4.
[10] V. Patel, J. Cheer, and S. Fontana, “Design and implementation of an active noise control headphone with directional hear-through capability,” IEEE Transactions on Consumer Electronics, vol. 66, no. 1, pp. 32–40, Feb. 2020.
[11] T. Xiao, B. Xu, and C. Zhao, “Spatially selective active noise control systems,” The Journal of the Acoustical Society of America, vol. 153, no. 5, pp. 2733–2744, May 2023.
[12] B. Van Veen and K. Buckley, “Beamforming: A versatile approach to spatial filtering,” IEEE ASSP Magazine, vol. 5, no. 2, pp. 4–24, 1988.
[13] S. Gannot, E. Vincent, S. Markovich-Golan, and A. Ozerov, “A consolidated perspective on multimicrophone speech enhancement and source separation,” IEEE/ACM Transactions on Audio, Speech, and Language Processing, vol. 25, no. 4, pp. 692–730, 2017.
[14] S. Doclo, W. Kellermann, S. Makino, and S. E. Nordholm, “Multichannel signal enhancement algorithms for assisted listening devices: Exploiting spatial diversity using multiple microphones,” IEEE Signal Processing Magazine, vol. 32, no. 2, pp. 18–30, Mar. 2015.
[15] T. Xiao and S. Doclo, “Effect of target signals and delays on spatially selective active noise control for open-fitting hearables,” in Proc. IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), Seoul, Republic of Korea, 2024, pp. 1056–1060.
[16] ——, “Spatially selective active noise control for open-fitting hearables with acausal optimization,” in Proc. Forum Acusticum Euronoise 2025, Málaga, Spain, Jun. 2025, pp. 117–124.
[17] T. Xiao, R. Roden, M. Blau, and S. Doclo, “Soft-constrained spatially selective active noise control for open-fitting hearables,” in Proc. IEEE Workshop on Applications of Signal Processing to Audio and Acoustics (WASPAA), Tahoe City, USA, 2025, pp. 1–5.
[18] H. Schepker, F. Denk, B. Kollmeier, and S. Doclo, “Robust single- and multi-loudspeaker least-squares-based equalization for hearing devices,” EURASIP Journal on Audio, Speech, and Music Processing, vol. 2022, no. 1, pp. 1–14, 2022.
[19] C. Veaux, J. Yamagishi, and K. MacDonald, “CSTR VCTK corpus: English multi-speaker corpus for CSTR voice cloning toolkit,” 2017. [Online]. Available: https://doi.org/10.7488/ds/2645
[20] British Broadcasting Corporation, “Sound sample 07025055,” BBC Sound Effects Archive, 2024, accessed: March 04, 2026. [Online]. Available: https://sound-effects.bbcrewind.co.uk/search?q=07025055
[21] G. Grimm, J. Luberadzka, and V. Hohmann, “A toolbox for rendering virtual acoustic environments in the context of audiology,” Acta acustica united with acustica, vol. 105, no. 3, pp. 566–578, 2019.
[22] G. Grimm, M. Hendrikse, and V. Hohmann, “Pub environment,” Sep. 2021. [Online]. Available: https://doi.org/10.5281/zenodo.5886987
[23] F. Denk, M. Lettau, H. Schepker, S. Doclo, R. Roden, M. Blau, J.-H. Bach, J. Wellmann, and B. Kollmeier, “A one-size-fits-all earpiece with multiple microphones and drivers for hearing device research,” in Proc. AES International Conference on Headphone Technology, San Francisco, USA, Aug. 2019, pp. 1–9.
[24] F. Denk and B. Kollmeier, “The hearpiece database of individual transfer functions of an in-the-ear earpiece for hearing device research,” Acta Acustica, vol. 5, no. 2, pp. 1–16, 2021.
[25] A. Spriet, M. Moonen, and J. Wouters, “Spatially pre-processed speech distortion weighted multi-channel Wiener filtering for noise reduction,” Signal Processing, vol. 84, no. 12, pp. 2367–2387, 2004.
[26] S. Doclo, A. Spriet, J. Wouters, and M. Moonen, “Frequency- domain criterion for the speech distortion weighted multichannel Wiener filter for robust noise reduction,” Speech Communication, vol. 49, no. 7, pp. 636–656, 2007.
[27] Acoustical Society of America (ASA), “Methods for Calculation of the Speech Intelligibility Index,” American National Stan- dards Institute (ANSI), ANSI/ASA S3.5-1997 Standard, 1997.
[28] A. Rix, J. Beerends, M. Hollier, and A. Hekstra, “Perceptual evaluation of speech quality (PESQ)–a new method for speech quality assessment of telephone networks and codecs,” in Proc. IEEE International Conference on Acoustics, Speech, and Signal Processing. Proceedings (ICASSP), Salt Lake City, USA, May 2001, pp. 749–752.
[29] J. Jensen and C. H. Taal, “An algorithm for predicting the intelligibility of speech masked by modulated noise maskers,” IEEE/ACM Transactions on Audio, Speech, and Language Processing, vol. 24, no. 11, pp. 2009–2022, 2016.
