---
title: Filtered-x LMS (FxLMS)
title_zh: 滤波-x 最小均方算法
type: algorithm
status: reviewed
tags: [anc, adaptive-filter, lms]
drive: []
related: [active-noise-control, widrow1975adaptive]
created: 2026-06-12
reviewed_by: []
---

## Summary | 摘要

FxLMS is the workhorse adaptive algorithm of active noise control: standard LMS diverges when a secondary path S(z) sits between the controller output and the error sensor, so FxLMS filters the reference signal through an estimate Ŝ(z) before the weight update, restoring gradient alignment.
FxLMS 是主动噪声控制的主力自适应算法：当控制器输出与误差传感器之间存在次级通路 S(z) 时，标准 LMS 会发散；FxLMS 先用次级通路估计 Ŝ(z) 对参考信号滤波再做权重更新，从而恢复梯度方向的正确性。

## Key points | 要点

- Tolerates secondary-path phase error up to ±90°; beyond that it diverges.
  可容忍次级通路相位误差至 ±90°，超过则发散。
- Convergence slows as the delay in S(z) grows; step size must shrink accordingly.
  S(z) 延迟越大收敛越慢，步长须相应减小。
- Ŝ(z) is usually identified offline with white noise, or online with auxiliary noise injection.
  Ŝ(z) 通常用白噪声离线辨识，或注入辅助噪声在线辨识。

## Method | 方法

```text
x'(n) = ŝ(n) * x(n)              # filter reference through secondary-path estimate
y(n)  = wᵀ(n) x(n)               # controller output to loudspeaker
e(n)  = d(n) + s(n) * y(n)       # residual at error microphone
w(n+1) = w(n) − μ e(n) x'(n)     # FxLMS weight update
```

## When to use | 适用场景

Default choice for feedforward ANC in ducts, headphones and vehicle cabins. Consider FxNLMS for varying reference power, leaky FxLMS against weight drift, and frequency-domain variants for long filters.
管道、耳机、车舱前馈 ANC 的默认选择。参考信号功率波动大时用 FxNLMS，权重漂移用 leaky FxLMS，长滤波器用频域变体。

## Implementation notes | 实现笔记

Normalize step size by filtered-reference power; watch for output saturation driving nonlinearity in the secondary path.
步长按滤波后参考信号功率归一化；注意输出饱和会引入次级通路非线性。

## My notes | 个人笔记

Draft for review — please check the ±90° phase bound citation before promoting.
待审草稿——晋升前请核对 ±90° 相位界的文献出处。

## References | 参考

- Related cards: [[active-noise-control]], [[widrow1975adaptive]]
- S. M. Kuo and D. R. Morgan, "Active noise control: a tutorial review," *Proc. IEEE*, vol. 87, no. 6, 1999.
