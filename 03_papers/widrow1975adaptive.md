---
title: "Adaptive noise cancelling: principles and applications"
title_zh: 自适应噪声消除：原理与应用
type: paper
status: official
citation_key: widrow1975adaptive
authors: [B. Widrow, J. R. Glover, J. M. McCool, J. Kaunitz, C. S. Williams, R. H. Hearn, J. R. Zeidler, E. Dong, R. C. Goodlin]
year: 1975
tags: [anc, adaptive-filter, lms, foundational]
drive: []
related: [active-noise-control, fxlms]
created: 2026-06-12
reviewed_by: []
---

## Summary | 摘要

The foundational paper on adaptive noise cancelling: a reference input correlated with the noise (but not the signal) is adaptively filtered and subtracted from the primary input, with the LMS algorithm driving the filter towards the Wiener solution without prior knowledge of signal statistics.
自适应噪声消除的奠基之作：取一路与噪声相关（而与目标信号无关）的参考输入，经自适应滤波后从主输入中减去；LMS 算法在无需信号统计先验的情况下将滤波器推向维纳最优解。

## Key points | 要点

- Cancelling via subtraction of an adaptively filtered reference — no fixed filter design needed.
  通过减去自适应滤波后的参考信号实现消噪——无需预先设计固定滤波器。
- LMS adaptation converges to the Wiener filter under stationarity assumptions.
  在平稳假设下，LMS 自适应收敛到维纳滤波器。
- Demonstrated on ECG, speech, and antenna sidelobe interference — the same structure generalizes across domains.
  在心电、语音与天线旁瓣干扰上验证——同一结构跨领域通用。

## Method | 方法

Primary input d(n) = s(n) + n0(n); reference x(n) correlated with n0. Adaptive filter output y(n) = wᵀ(n)x(n); error e(n) = d(n) − y(n) is both the system output and the adaptation signal: w(n+1) = w(n) + 2μ e(n) x(n).
主输入 d(n) = s(n) + n0(n)；参考 x(n) 与 n0 相关。自适应滤波输出 y(n) = wᵀ(n)x(n)；误差 e(n) = d(n) − y(n) 既是系统输出又是自适应驱动信号：w(n+1) = w(n) + 2μ e(n) x(n)。

## Results | 结果

Strong interference rejection in ECG fetal-heartbeat extraction and 60 Hz hum removal; convergence behaviour analysed via eigenvalue spread of the reference autocorrelation matrix.
在胎儿心电提取与 60 Hz 工频干扰消除中表现出强抑制能力；收敛速度由参考自相关矩阵的特征值散布决定。

## My notes | 个人笔记

The direct ancestor of [[fxlms]] — FxLMS adds the secondary-path filter into the reference branch to handle acoustic ANC. Read §IV before implementing anything.
[[fxlms]] 的直接前身——FxLMS 在参考支路中加入次级通路滤波以适配声学 ANC。动手实现前先读第 IV 节。

## References | 参考

- Related cards: [[active-noise-control]], [[fxlms]]
- B. Widrow et al., "Adaptive noise cancelling: principles and applications," *Proc. IEEE*, vol. 63, no. 12, 1975.
