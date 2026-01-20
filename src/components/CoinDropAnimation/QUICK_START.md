# 🚀 金币掉落动画 - 快速开始

## 📦 5 分钟快速集成

### 1️⃣ 引入组件

```tsx
import CoinDropAnimation from '@/components/CoinDropAnimation';
```

### 2️⃣ 添加状态

```tsx
const [showCoins, setShowCoins] = useState(false);
```

### 3️⃣ 使用组件

```tsx
<CoinDropAnimation
  visible={showCoins}
  coinCount={20}
  onComplete={() => setShowCoins(false)}
/>
```

### 4️⃣ 触发动画

```tsx
<Button onClick={() => setShowCoins(true)}>
  触发奖励
</Button>
```

---

## 🎯 常见场景示例

### 场景 1：支付成功

```tsx
const handlePayment = async () => {
  try {
    await paymentAPI();
    setShowCoins(true); // 触发金币动画
    message.success('支付成功！');
  } catch (error) {
    message.error('支付失败');
  }
};

<CoinDropAnimation
  visible={showCoins}
  coinCount={30}
  playSound={true}
  onComplete={() => {
    setShowCoins(false);
    history.push('/success');
  }}
/>
```

### 场景 2：任务完成

```tsx
const handleTaskComplete = () => {
  // 完成任务逻辑
  completeTask();
  
  // 显示奖励动画
  setShowCoins(true);
};

<CoinDropAnimation
  visible={showCoins}
  coinCount={10}
  duration={2000}
  shouldPile={false}
  onComplete={() => setShowCoins(false)}
/>
```

### 场景 3：签到打卡

```tsx
const handleCheckIn = async () => {
  const result = await checkInAPI();
  
  if (result.success) {
    setShowCoins(true);
    message.success(`签到成功！获得 ${result.coins} 金币`);
  }
};

<CoinDropAnimation
  visible={showCoins}
  coinCount={5}
  duration={1500}
  playSound={true}
  shouldPile={false}
  onComplete={() => setShowCoins(false)}
/>
```

---

## ⚙️ 常用配置

### 少量金币（10-20个）
```tsx
<CoinDropAnimation
  visible={show}
  coinCount={10}
  duration={2000}
  shouldPile={false}
  onComplete={() => setShow(false)}
/>
```

### 中等金币（20-50个）
```tsx
<CoinDropAnimation
  visible={show}
  coinCount={30}
  duration={3000}
  shouldPile={false}
  onComplete={() => setShow(false)}
/>
```

### 大量金币 + 堆积（50+个）
```tsx
<CoinDropAnimation
  visible={show}
  coinCount={50}
  duration={4000}
  shouldPile={true}
  onComplete={() => setShow(false)}
/>
```

---

## 🎨 自定义样式

### 红色金币
```tsx
<CoinDropAnimation
  coinColor="#FF6B6B"
  // ... 其他属性
/>
```

### 全屏动画
```tsx
<CoinDropAnimation
  width={window.innerWidth}
  height={window.innerHeight}
  // ... 其他属性
/>
```

---

## 🔕 禁用音效

```tsx
<CoinDropAnimation
  playSound={false}
  // ... 其他属性
/>
```

---

## 📱 完整示例

```tsx
import React, { useState } from 'react';
import { Button, message } from 'antd';
import CoinDropAnimation from '@/components/CoinDropAnimation';

const MyPage: React.FC = () => {
  const [showCoins, setShowCoins] = useState(false);

  const handleReward = () => {
    // 触发动画
    setShowCoins(true);
    
    // 显示提示
    message.success('恭喜获得 20 金币！');
  };

  return (
    <div>
      <Button type="primary" onClick={handleReward}>
        领取奖励
      </Button>
      
      <CoinDropAnimation
        visible={showCoins}
        coinCount={20}
        duration={3000}
        playSound={true}
        shouldPile={false}
        coinColor="#FFD700"
        onComplete={() => {
          setShowCoins(false);
          console.log('动画完成');
        }}
      />
    </div>
  );
};

export default MyPage;
```

---

## 💡 最佳实践

1. **性能优化**：金币数量建议不超过 100 个
2. **用户体验**：动画时长建议 2-4 秒
3. **音效控制**：在静音场景下设置 `playSound={false}`
4. **回调处理**：在 `onComplete` 中执行后续操作
5. **状态管理**：使用 `useState` 控制显示/隐藏

---

## 🐛 常见问题

**Q: 动画不显示？**  
A: 检查 `visible` 是否为 `true`

**Q: 音效不播放？**  
A: 确保用户有交互操作（点击按钮等）

**Q: 如何控制动画区域？**  
A: 使用 `width` 和 `height` 属性

---

## 📚 更多文档

查看完整文档：[README.md](./README.md)  
查看演示代码：[demo.tsx](./demo.tsx)

---

**Enjoy! 🎉**
