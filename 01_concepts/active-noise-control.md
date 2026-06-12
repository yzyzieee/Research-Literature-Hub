---
title: Active noise control (ANC)
title_zh: 主动噪声控制
type: concept
status: official
tags: [anc, acoustics, adaptive-filter]
drive: []
related: [widrow1975adaptive, fxlms]
created: 2026-06-12
reviewed_by: []
---

## Summary | 摘要

Active noise control cancels unwanted sound by generating an "anti-noise" signal of equal amplitude and opposite phase through secondary sources (loudspeakers), exploiting destructive interference. It is most effective at low frequencies where passive absorption is bulky and inefficient.
主动噪声控制通过次级声源（扬声器）发出与噪声幅度相同、相位相反的"反噪声"，利用相消干涉来抵消噪声。它在低频段最有效——这正是被动吸声材料笨重且低效的频段。

## Key points | 要点

- Complements passive control: ANC for low frequency, passive materials for high frequency.
  与被动降噪互补：低频靠 ANC，高频靠吸声材料。
- Needs a reference or error sensor; performance hinges on the secondary path (speaker→error mic) estimate.
  依赖参考/误差传感器；性能取决于次级通路（扬声器→误差麦克风）的估计精度。
- Feedforward, feedback and hybrid structures; adaptive algorithms (e.g. [[fxlms]]) track changing noise.
  分前馈、反馈与混合结构；自适应算法（如 [[fxlms]]）用于跟踪时变噪声。

## Intuition | 直觉理解

Two identical waves shifted by half a wavelength sum to silence. The controller's whole job is producing that shifted copy fast enough and accurately enough at the listening point.
两列相差半个波长的相同波叠加即为静音。控制器的全部任务，就是在聆听点足够快、足够准地造出那份"错半拍"的拷贝。

## Math | 数学表达

Residual error at the error microphone: e(n) = d(n) + s(n) * y(n), where d(n) is primary noise, y(n) the controller output, s(n) the secondary-path impulse response, and * convolution. The controller minimizes E[e²(n)].
误差麦克风处的残差：e(n) = d(n) + s(n) * y(n)，其中 d(n) 为初级噪声，y(n) 为控制器输出，s(n) 为次级通路冲激响应，* 表示卷积。控制器最小化 E[e²(n)]。

## My notes | 个人笔记

Starting point for the team's headphone / duct ANC experiments; see the paper card [[widrow1975adaptive]] for the adaptive-filtering origin.
课题组耳机 / 管道 ANC 实验的起点；自适应滤波的源头见论文卡 [[widrow1975adaptive]]。

## References | 参考

- Related cards: [[widrow1975adaptive]], [[fxlms]]
- S. M. Kuo and D. R. Morgan, *Active Noise Control Systems*, Wiley, 1996.
