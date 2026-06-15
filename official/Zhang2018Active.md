---
title: 'Active Noise Control Over Space: A Wave Domain Approach'
entry_type: literature
publication_type: journal-paper
primary_domain: active-noise-control
domains:
  - active-noise-control
  - beamforming-arrays
  - room-acoustics
venue: 'IEEE/ACM Transactions on Audio, Speech, and Language Processing'
doi: 10.1109/TASLP.2018.2795756
abstract: >-
  Noise control and cancellation over a spatial region is a fundamental problem
  in acoustic signal processing. This paper uses wave-domain adaptive algorithms
  to calculate secondary-source driving signals and cancel a primary noise field
  over a control region.
status: official
citation_key: Zhang2018Active
authors:
  - Jihui Zhang
  - Thushara D. Abhayapala
  - Wen Zhang
  - Prasanga N. Samarasinghe
  - Shouda Jiang
year: 2018
tags:
  - active-noise-control
  - wave-domain
  - spatial-noise
  - multichannel
  - reverberant-room
key_references:
  - title: 'Recent advances in active noise control inside automobile cabins: Toward quieter cars'
    doi: ''
    year: 2016
    role: survey
    reason: Reviews spatial ANC challenges and practical vehicle-cabin applications that motivate regional control.
    status: external
    linked_card: null
  - title: 'Recent advances on active noise control: Open issues and innovative applications'
    doi: ''
    year: 2012
    role: survey
    reason: Provides the broader ANC background and open problems behind spatial noise control.
    status: external
    linked_card: null
  - title: 'Multichannel active noise control for spatially sparse noise fields'
    doi: ''
    year: 2016
    role: method
    reason: Introduces closely related spatial multichannel control ideas developed by the same research group.
    status: external
    linked_card: null
  - title: 'Noise cancellation over spatial regions using adaptive wave domain processing'
    doi: ''
    year: 2015
    role: foundation
    reason: Presents the earlier adaptive wave-domain formulation extended in this paper.
    status: external
    linked_card: null
  - title: 'Efficient massive multichannel active noise control using wave-domain adaptive filtering'
    doi: ''
    year: 2008
    role: foundation
    reason: Establishes a wave-domain adaptive filtering baseline for massive multichannel ANC.
    status: external
    linked_card: null
  - title: 'Theory and design of sound field reproduction in reverberant rooms'
    doi: ''
    year: 2005
    role: method
    reason: Supplies sound-field representation theory relevant to the reverberant-room formulation.
    status: external
    linked_card: null
drive:
  - https://drive.google.com/file/d/1_1lODaviOAezdyq8q5-TKP8Kr9v98rDg/view?usp=drivesdk
related: []
created: '2026-06-14'
reviewed_by: []
rating: null
ratings: []
comments: []
uploaded_by: YZY
uploaded_at: '2026-06-14T12:28:12.917Z'
pdf_uploaded_by: YZY
pdf_uploaded_at: '2026-06-14T12:27:46.299Z'
pdf_file_name: 0004_Zhang2018Active.pdf
pdf_reused: false
activity:
  - action: pdf_uploaded
    by: YZY
    at: '2026-06-14T12:27:46.299Z'
    detail: 0004_Zhang2018Active.pdf
  - action: card_published
    by: YZY
    at: '2026-06-14T12:28:12.917Z'
---
## Summary

This paper develops four adaptive wave-domain active noise control algorithms for reducing a noise field over an extended spatial region. It compares modal-coefficient and acoustic-energy objectives, each implemented through either direct loudspeaker-weight updates or secondary-field modal updates. Simulations show faster convergence and better regional attenuation than conventional multi-point control, especially when the available loudspeakers cannot reproduce every active spatial mode.

## Problem

Point-wise ANC can create strong attenuation at error microphones while leaving uneven performance elsewhere. Applications such as vehicle and aircraft cabins instead need stable noise reduction across an area, including in reverberant environments and with a limited number of secondary sources.

## Method

The control region is represented with cylindrical harmonics rather than a collection of independent error points. At a fixed frequency, the residual field is summarized by modal coefficients:

$$
\boldsymbol{\alpha}_{e}
=
\boldsymbol{\alpha}_{p}
+
\mathbf C\mathbf d.
$$

Here, $\boldsymbol{\alpha}_{p}$ contains the primary-field coefficients, $\mathbf d$ contains the loudspeaker driving weights, and $\mathbf C$ maps those weights to secondary-field coefficients.

The first objective minimizes residual modal energy:

$$
J_{\mathrm{mode}}
=
\left\lVert \boldsymbol{\alpha}_{e} \right\rVert_2^2.
$$

The second minimizes acoustic potential energy over the region using a spatial weighting matrix $\mathbf A$:

$$
J_{\mathrm{energy}}
=
\boldsymbol{\alpha}_{e}^{\mathsf H}
\mathbf A
\boldsymbol{\alpha}_{e}.
$$

For each objective, the authors derive normalized steepest-descent updates in two forms: directly updating $\mathbf d$, or adapting the desired secondary modal coefficients and then recovering the loudspeaker weights. These combinations produce NWD-D, NWD-M, NEWD-D, and NEWD-M. The simulations compare them with normalized multi-point control in free-field and reverberant rooms.

## Key results

All four wave-domain methods improve regional noise reduction and convergence over normalized multi-point control. When enough loudspeakers are available, modal-update variants converge particularly quickly. When the loudspeaker count is smaller than the number of active modes, the energy-based variants provide the strongest attenuation and convergence behavior. Performance can degrade at irregular frequencies associated with zeros of the cylindrical basis functions.

## Strengths

The paper gives a unified framework that separates the choice of spatial objective from the choice of adaptive variable. It evaluates both ideal and reverberant conditions and explicitly studies the practically important case of limited secondary-source count.

## Limitations

The main evidence is simulation-based. A single circular array also suffers from irregular-frequency sensitivity, and the energy-based variants may require more loudspeaker effort when spatial reproduction resources are limited.

## Relevance to our group

The paper is useful for regional ANC, spatial audio, and multichannel controller design. It clarifies when modal-domain control is preferable to point-wise error minimization and exposes the trade-off between reproducible spatial modes, control energy, and convergence speed.

## Notes

For implementation, verify the basis truncation order, array geometry, and conditioning around irregular frequencies. A practical follow-up should compare these algorithms under measured secondary paths and three-dimensional spherical-harmonic models.
