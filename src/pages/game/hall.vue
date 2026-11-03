<template>
  <view class="hall">
    <view class="hall-bg"></view>

    <view class="hall-top">
      <view class="hall-user">
        <view class="hall-avatar">
          <text class="hall-avatar-txt">{{ avatarText }}</text>
          <text class="hall-avatar-lv">Lv.{{ level }}</text>
        </view>
        <view class="hall-user-main">
          <view class="hall-user-line">
            <text class="hall-nick">{{ nickname }}</text>
            <text class="hall-id">ID {{ uid }}</text>
          </view>
          <view class="hall-wallet">
            <view class="hall-wallet-item" @click="onWallet('欢乐豆')">
              <text class="hall-coin-icon">金</text>
              <text class="hall-coin-num">{{ beansText }}</text>
              <text class="hall-plus">+</text>
            </view>
            <view class="hall-wallet-item" @click="onWallet('钻石')">
              <text class="hall-diamond-icon">钻</text>
              <text class="hall-coin-num">{{ diamondText }}</text>
              <text class="hall-plus">+</text>
            </view>
          </view>
        </view>
      </view>
      <view class="hall-top-actions">
        <view class="hall-icon-btn" @click="onEntry('邮件中心')">✉</view>
        <view class="hall-icon-btn" @click="onEntry('设置')">⚙</view>
      </view>
    </view>

    <view class="hall-banner" @click="onEntry('活动中心')">
      <view class="hall-banner-tag">活动</view>
      <text class="hall-banner-text">该不该约束？点我看看就知道</text>
      <text class="hall-banner-arrow">›</text>
    </view>

    <view class="hall-hero">
      <view class="hall-hero-title">
        <text class="hall-hero-cn">经典模式</text>
        <text class="hall-hero-sub">三人斗地主 · 真人联机 · 机器人补位</text>
      </view>
      <view class="hall-hero-face">
        <view class="hero-body"></view>
        <view class="hero-shirt"></view>
        <view class="hero-collar"></view>
        <view class="hero-neck"></view>
        <view class="hero-head"></view>
        <view class="hero-ear hero-ear--l"></view>
        <view class="hero-ear hero-ear--r"></view>
        <view class="hero-brow hero-brow--l"></view>
        <view class="hero-brow hero-brow--r"></view>
        <view class="hero-eye hero-eye--l"></view>
        <view class="hero-eye hero-eye--r"></view>
        <view class="hero-mustache"></view>
        <view class="hero-mouth"></view>
        <view class="hero-hat"></view>
        <view class="hero-brim"></view>
      </view>
    </view>

    <view class="hall-rooms">
      <view
        v-for="room in rooms"
        :key="room.id"
        class="hall-room"
        :class="'hall-room--' + room.tone"
        @click="enterRoom(room)"
      >
        <view class="hall-room-left">
          <view class="hall-room-name-row">
            <text class="hall-room-name">{{ room.name }}</text>
            <text v-if="room.hot" class="hall-room-hot">大家都在玩</text>
          </view>
          <text class="hall-room-desc">{{ room.desc }}</text>
          <view class="hall-room-meta">
            <text class="hall-room-base">底分 {{ room.base }}</text>
            <text class="hall-room-gate">门槛 {{ room.gate }}</text>
          </view>
        </view>
        <view class="hall-room-right">
          <view class="hall-room-count">
            <text class="hall-room-count-num">{{ room.online }}</text>
            <text class="hall-room-count-unit">人在线</text>
          </view>
          <view class="hall-room-enter">进入</view>
        </view>
      </view>
    </view>

    <view class="hall-nav">
      <view v-for="item in navs" :key="item.key" class="hall-nav-item" @click="onEntry(item.name)">
        <text class="hall-nav-icon">{{ item.icon }}</text>
        <text class="hall-nav-text">{{ item.name }}</text>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * 游戏大厅页。
 * 功能入口与文案取自原版 SceneTopTitleCfg3D 与 GameTalkConfigCfg，
 * 场次沿用新手场 / 普通场 / 高级场三档。
 */
export default
{
  data()
  {
    return {
      nickname: '玩家',
      uid: '100086',
      level: 12,
      beans: 12000,
      diamond: 368,
      rooms: [
        {
          id: 'novice',
          name: '新手场',
          desc: '底分低，先熟悉规则再上桌',
          base: 10,
          gate: '0 豆',
          online: '3.2 万',
          tone: 'green',
          hot: false
        },
        {
          id: 'normal',
          name: '普通场',
          desc: '标准三人斗地主，赢豆主战场',
          base: 100,
          gate: '1,000 豆',
          online: '8.6 万',
          tone: 'blue',
          hot: true
        },
        {
          id: 'senior',
          name: '高级场',
          desc: '高底分对局，一局定输赢',
          base: 1000,
          gate: '10,000 豆',
          online: '1.9 万',
          tone: 'gold',
          hot: false
        }
      ],
      navs: [
        { key: 'shop', name: '商城', icon: '¥' },
        { key: 'bag', name: '背包', icon: '▣' },
        { key: 'task', name: '任务', icon: '✓' },
        { key: 'act', name: '活动', icon: '✦' },
        { key: 'friend', name: '好友', icon: '☺' },
        { key: 'rank', name: '排行', icon: '▲' }
      ]
    };
  },

  computed:
  {
    /**
     * 头像首字
     * @returns {string} 单字
     */
    avatarText()
    {
      return String(this.nickname || '玩').slice(0, 1);
    },

    /**
     * 欢乐豆展示文案
     * @returns {string} 文案
     */
    beansText()
    {
      const n = Number(this.beans) || 0;
      if (n >= 10000)
      {
        return (n / 10000).toFixed(1) + '万';
      }
      return String(n);
    },

    /**
     * 钻石展示文案
     * @returns {string} 文案
     */
    diamondText()
    {
      return String(this.diamond);
    }
  },

  mounted()
  {
    const saved = uni.getStorageSync('ddz_nickname');
    if (saved)
    {
      this.nickname = saved;
    }
    const coin = uni.getStorageSync('ddz_coin');
    if (coin)
    {
      this.beans = coin;
    }
  },

  methods:
  {
    /**
     * 进入指定场次的牌桌
     * @param {Object} room 场次配置
     * @returns {void}
     */
    enterRoom(room)
    {
      uni.setStorageSync('ddz_room', room.id);
      uni.setStorageSync('ddz_base', room.base);
      uni.navigateTo({ url: '/pages/game/ddz' });
    },

    /**
     * 统一的功能入口点击反馈
     * @param {string} name 入口名称
     * @returns {void}
     */
    onEntry(name)
    {
      uni.showToast({ title: name + '开放中', icon: 'none' });
    },

    /**
     * 货币入口点击
     * @param {string} name 货币名称
     * @returns {void}
     */
    onWallet(name)
    {
      uni.showToast({ title: '获取' + name, icon: 'none' });
    }
  }
};
</script>

<style lang="scss" scoped>
.hall { position: absolute; top: 0; left: 0; width: 100%; height: 100vh; padding: 88rpx 28rpx 220rpx; box-sizing: border-box; overflow-y: auto; -webkit-overflow-scrolling: touch; }
.hall-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(120% 70% at 50% 0%, #7b5cd6 0%, #5b3fb0 42%, #3a2380 100%); z-index: -1; }

.hall-top { display: flex; align-items: flex-start; justify-content: space-between; }
.hall-user { display: flex; align-items: center; }
.hall-avatar { position: relative; width: 108rpx; height: 108rpx; border-radius: 50%; background: linear-gradient(160deg, #ffe9a8, #e0a52c); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 4rpx rgba(255, 233, 168, 0.55); }
.hall-avatar-txt { font-size: 44rpx; color: #5b3fb0; font-weight: bold; }
.hall-avatar-lv { position: absolute; bottom: -14rpx; left: 50%; transform: translateX(-50%); padding: 2rpx 12rpx; border-radius: 12rpx; background: #3a2380; border: 2rpx solid #ffd45e; font-size: 18rpx; color: #ffd45e; }
.hall-user-main { margin-left: 22rpx; }
.hall-user-line { display: flex; align-items: baseline; }
.hall-nick { font-size: 32rpx; color: #ffffff; font-weight: bold; }
.hall-id { margin-left: 14rpx; font-size: 20rpx; color: rgba(255, 255, 255, 0.55); }
.hall-wallet { display: flex; margin-top: 12rpx; }
.hall-wallet-item { display: flex; align-items: center; height: 44rpx; padding: 0 12rpx 0 6rpx; margin-right: 14rpx; border-radius: 22rpx; background: rgba(0, 0, 0, 0.35); }
.hall-coin-icon { width: 30rpx; height: 30rpx; line-height: 30rpx; text-align: center; border-radius: 50%; background: #ffd45e; color: #7a5200; font-size: 18rpx; font-weight: bold; }
.hall-diamond-icon { width: 30rpx; height: 30rpx; line-height: 30rpx; text-align: center; border-radius: 50%; background: #63e6ff; color: #0b4a63; font-size: 18rpx; font-weight: bold; }
.hall-coin-num { margin-left: 10rpx; font-size: 22rpx; color: #ffe9a8; }
.hall-plus { margin-left: 8rpx; font-size: 24rpx; color: #ffd45e; }
.hall-top-actions { display: flex; }
.hall-icon-btn { width: 64rpx; height: 64rpx; margin-left: 14rpx; line-height: 64rpx; text-align: center; border-radius: 50%; background: rgba(0, 0, 0, 0.32); color: #ffe9a8; font-size: 30rpx; }

.hall-banner { display: flex; align-items: center; height: 62rpx; margin-top: 26rpx; padding: 0 20rpx; border-radius: 32rpx; background: rgba(0, 0, 0, 0.3); }
.hall-banner-tag { padding: 2rpx 12rpx; border-radius: 10rpx; background: #ffd45e; color: #5b3fb0; font-size: 20rpx; font-weight: bold; }
.hall-banner-text { flex: 1; margin-left: 16rpx; font-size: 24rpx; color: #ffffff; }
.hall-banner-arrow { font-size: 30rpx; color: rgba(255, 255, 255, 0.6); }

.hall-hero { position: relative; height: 216rpx; margin-top: 26rpx; border-radius: 28rpx; background: linear-gradient(140deg, rgba(255, 212, 94, 0.22), rgba(255, 255, 255, 0.06)); border: 2rpx solid rgba(255, 212, 94, 0.45); overflow: hidden; }
.hall-hero-title { position: absolute; left: 32rpx; top: 30rpx; }
.hall-hero-cn { display: block; font-size: 48rpx; color: #ffe9a8; font-weight: bold; letter-spacing: 6rpx; text-shadow: 0 4rpx 0 rgba(90, 40, 0, 0.45); }
.hall-hero-sub { display: block; margin-top: 14rpx; font-size: 22rpx; color: rgba(255, 255, 255, 0.78); }
.hall-hero-face { position: absolute; right: 22rpx; bottom: 0; width: 160rpx; height: 200rpx; }
.hero-body { position: absolute; left: 18rpx; bottom: 0; width: 124rpx; height: 76rpx; border-radius: 36rpx 36rpx 8rpx 8rpx; background: linear-gradient(160deg, #ffd45e, #dfa02a); }
.hero-shirt { position: absolute; left: 64rpx; bottom: 36rpx; width: 34rpx; height: 40rpx; background: #fff8e6; border-radius: 5rpx; }
.hero-collar { position: absolute; left: 50rpx; bottom: 26rpx; width: 0; height: 0; border-left: 16rpx solid transparent; border-right: 16rpx solid transparent; border-bottom: 32rpx solid #fff8e6; }
.hero-neck { position: absolute; left: 70rpx; top: 112rpx; width: 24rpx; height: 16rpx; background: #e8b07a; }
.hero-head { position: absolute; left: 42rpx; top: 34rpx; width: 76rpx; height: 82rpx; border-radius: 50% 50% 46% 46%; background: linear-gradient(160deg, #ffe3c2, #eeb98a); }
.hero-ear { position: absolute; top: 70rpx; width: 12rpx; height: 17rpx; border-radius: 50%; background: #eeb98a; }
.hero-ear--l { left: 36rpx; }
.hero-ear--r { right: 36rpx; }
.hero-brow { position: absolute; top: 62rpx; width: 18rpx; height: 4rpx; border-radius: 4rpx; background: #4a2c14; }
.hero-brow--l { left: 54rpx; }
.hero-brow--r { right: 54rpx; }
.hero-eye { position: absolute; top: 72rpx; width: 9rpx; height: 9rpx; border-radius: 50%; background: #241408; }
.hero-eye--l { left: 58rpx; }
.hero-eye--r { right: 58rpx; }
.hero-mustache { position: absolute; left: 52rpx; top: 90rpx; width: 56rpx; height: 12rpx; border-radius: 9rpx 9rpx 5rpx 5rpx; background: #2e1a0c; }
.hero-mouth { position: absolute; left: 70rpx; top: 102rpx; width: 20rpx; height: 7rpx; border-radius: 0 0 10rpx 10rpx; background: #8a3a34; }
.hero-hat { position: absolute; left: 44rpx; top: 16rpx; width: 72rpx; height: 30rpx; border-radius: 18rpx 18rpx 5rpx 5rpx; background: linear-gradient(160deg, #e8453a, #b8281f); }
.hero-brim { position: absolute; left: 26rpx; top: 40rpx; width: 108rpx; height: 10rpx; border-radius: 7rpx; background: #8f1d16; }

.hall-rooms { margin-top: 20rpx; }
.hall-room { display: flex; align-items: center; justify-content: space-between; padding: 22rpx 26rpx; margin-bottom: 16rpx; border-radius: 24rpx; background: rgba(0, 0, 0, 0.3); border: 2rpx solid rgba(255, 255, 255, 0.14); }
.hall-room--green { border-left: 8rpx solid #3fd07a; }
.hall-room--blue { border-left: 8rpx solid #63a4ff; }
.hall-room--gold { border-left: 8rpx solid #ffd45e; }
.hall-room-name-row { display: flex; align-items: center; }
.hall-room-name { font-size: 36rpx; color: #ffffff; font-weight: bold; }
.hall-room-hot { margin-left: 14rpx; padding: 2rpx 10rpx; border-radius: 8rpx; background: rgba(255, 212, 94, 0.2); color: #ffd45e; font-size: 18rpx; }
.hall-room-desc { display: block; margin-top: 10rpx; font-size: 22rpx; color: rgba(255, 255, 255, 0.62); }
.hall-room-meta { margin-top: 14rpx; }
.hall-room-base { padding: 4rpx 14rpx; border-radius: 10rpx; background: rgba(255, 212, 94, 0.16); color: #ffd45e; font-size: 20rpx; }
.hall-room-gate { margin-left: 12rpx; font-size: 20rpx; color: rgba(255, 255, 255, 0.5); }
.hall-room-right { display: flex; flex-direction: column; align-items: center; }
.hall-room-count { display: flex; align-items: baseline; }
.hall-room-count-num { font-size: 26rpx; color: #7dff9b; font-weight: bold; }
.hall-room-count-unit { margin-left: 4rpx; font-size: 18rpx; color: rgba(255, 255, 255, 0.5); }
.hall-room-enter { margin-top: 14rpx; padding: 8rpx 34rpx; border-radius: 28rpx; background: linear-gradient(180deg, #ffd45e, #e8a317); color: #5a3200; font-size: 26rpx; font-weight: bold; }

.hall-nav { position: fixed; left: 0; bottom: 0; width: 100%; display: flex; justify-content: space-around; padding: 18rpx 12rpx 30rpx; background: rgba(20, 10, 50, 0.92); border-top: 2rpx solid rgba(255, 212, 94, 0.3); }
.hall-nav-item { display: flex; flex-direction: column; align-items: center; }
.hall-nav-icon { width: 56rpx; height: 56rpx; line-height: 56rpx; text-align: center; border-radius: 18rpx; background: rgba(255, 212, 94, 0.16); color: #ffd45e; font-size: 28rpx; }
.hall-nav-text { margin-top: 8rpx; font-size: 20rpx; color: rgba(255, 255, 255, 0.72); }
</style>
