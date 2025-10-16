<template>
  <TabView
    scrollable
    style='width: 18rem'
    @keydown='handleKeyDown'
    @keydown.enter='handleEnter'
    @tab-change='focusWhenChangeTab'>
    <TabPanel :header='`${t("chat.emoji.face")} 1`'>
      <div class='emoji text-xl'>
        <p>
          <span tabindex='1'>😀</span><span tabindex='2'>😃</span><span tabindex='3'>😄</span>
          <span tabindex='4'>😁</span><span tabindex='5'>😆</span>
          <span tabindex='6'>😅</span><span tabindex='7'>😂</span><span tabindex='8'>🤣</span>
          <span tabindex='9'>🥲</span><span tabindex='10'>🥹</span>
        </p>

        <p>
          <span tabindex='11'>☺️</span><span tabindex='12'>😊</span><span tabindex='13'>😇</span>
          <span tabindex='14'>🙂</span><span tabindex='15'>🙃</span>
          <span tabindex='16'>😉</span><span tabindex='17'>😌</span><span tabindex='18'>😍</span>
          <span tabindex='19'>🥰</span><span tabindex='20'>😘</span>
        </p>

        <p>
          <span tabindex='21'>😗</span><span tabindex='22'>😙</span><span tabindex='23'>😚</span>
          <span tabindex='24'>😋</span><span tabindex='25'>😛</span>
          <span tabindex='26'>😝</span><span tabindex='27'>😜</span><span tabindex='28'>🤪</span>
          <span tabindex='29'>🤨</span><span tabindex='30'>🧐</span>
        </p>

        <p>
          <span tabindex='31'>🤓</span><span tabindex='32'>😎</span><span tabindex='33'>🥸</span>
          <span tabindex='34'>🤩</span><span tabindex='35'>🥳</span>
          <span tabindex='36'>😏</span><span tabindex='37'>😒</span><span tabindex='38'>😞</span>
          <span tabindex='39'>😔</span><span tabindex='40'>😟</span>
        </p>

        <p>
          <span tabindex='41'>😕</span><span tabindex='42'>🙁</span><span tabindex='43'>☹️</span>
          <span tabindex='44'>😣</span><span tabindex='45'>😖</span>
          <span tabindex='46'>😫</span><span tabindex='47'>😩</span><span tabindex='48'>🥺</span>
          <span tabindex='49'>😢</span><span tabindex='50'>😭</span>
        </p>

        <p>
          <span tabindex='51'>😮‍💨</span><span tabindex='52'>😤</span><span tabindex='53'>😠</span>
          <span tabindex='54'>😡</span><span tabindex='55'>🤬</span><span tabindex='56'>🤯</span>
          <span tabindex='57'>😳</span><span tabindex='58'>🥵</span><span tabindex='59'>🥶</span>
          <span tabindex='60'>😱</span>
        </p>

        <p>
          <span tabindex='61'>😨</span><span tabindex='62'>😰</span><span tabindex='63'>😥</span>
          <span tabindex='64'>😓</span><span tabindex='65'>🫣</span>
          <span tabindex='66'>🤗</span><span tabindex='67'>🫡</span><span tabindex='68'>🤔</span>
          <span tabindex='69'>🫢</span><span tabindex='70'>🤭</span>
        </p>
      </div>

    </TabPanel>
    <TabPanel :header='`${t("chat.emoji.face")} 2`'>
      <div class='emoji text-xl'>
        <p>
          <span tabindex='1'>🤫</span><span tabindex='2'>🤥</span><span tabindex='3'>😶</span>
          <span tabindex='4'>😶‍🌫️</span><span tabindex='5'>😐</span>
          <span tabindex='6'>😑</span><span tabindex='7'>😬</span><span tabindex='8'>🫨</span>
          <span tabindex='9'>🫠</span><span tabindex='10'>🙄</span>
        </p>

        <p>
          <span tabindex='11'>😯</span><span tabindex='12'>😦</span><span tabindex='13'>😧</span>
          <span tabindex='14'>😮</span><span tabindex='15'>😲</span>
          <span tabindex='16'>🥱</span><span tabindex='17'>😴</span><span tabindex='18'>🤤</span>
          <span tabindex='19'>😪</span><span tabindex='20'>😵</span>
        </p>

        <p>
          <span tabindex='21'>😵‍💫</span><span tabindex='22'>🫥</span><span tabindex='23'>🤐</span>
          <span tabindex='24'>🥴</span><span tabindex='25'>🤢</span>
          <span tabindex='26'>🤮</span><span tabindex='27'>🤧</span><span tabindex='28'>😷</span>
          <span tabindex='29'>🤒</span><span tabindex='30'>🤕</span>
        </p>

        <p>
          <span tabindex='31'>🤑</span><span tabindex='32'>🤠</span><span tabindex='33'>😈</span>
          <span tabindex='34'>👿</span><span tabindex='35'>👹</span>
          <span tabindex='36'>👺</span><span tabindex='37'>🤡</span><span tabindex='38'>💩</span>
          <span tabindex='39'>👻</span><span tabindex='40'>💀</span>
        </p>

        <p>
          <span tabindex='41'>☠️</span><span tabindex='42'>👽</span><span tabindex='43'>👾</span>
          <span tabindex='44'>🤖</span><span tabindex='45'>🎃</span>
          <span tabindex='46'>😺</span><span tabindex='47'>😸</span><span tabindex='48'>😹</span>
          <span tabindex='49'>😻</span><span tabindex='50'>😼</span>
        </p>

        <p>
          <span tabindex='51'>😽</span><span tabindex='52'>🙀</span><span tabindex='53'>😿</span>
          <span tabindex='54'>😾</span>
        </p>
      </div>

    </TabPanel>
    <TabPanel :header='t("chat.emoji.body")'>
      <div class='emoji text-xl'>
        <p>
          <span tabindex='1'>👋</span><span tabindex='2'>🤚</span><span tabindex='3'>🖐</span>
          <span tabindex='4'>✋</span><span tabindex='5'>🖖</span>
          <span tabindex='6'>👌</span><span tabindex='7'>🤌</span><span tabindex='8'>🤏</span>
          <span tabindex='9'>✌️</span><span tabindex='10'>🤞</span>
        </p>

        <p>
          <span tabindex='11'>🫰</span><span tabindex='12'>🤟</span><span tabindex='13'>🤘</span>
          <span tabindex='14'>🤙</span><span tabindex='15'>🫵</span>
          <span tabindex='16'>🫱</span><span tabindex='17'>🫲</span><span tabindex='18'>🫸</span>
          <span tabindex='19'>🫷</span><span tabindex='20'>🫳</span>
        </p>

        <p>
          <span tabindex='21'>🫴</span><span tabindex='22'>👈</span><span tabindex='23'>👉</span>
          <span tabindex='24'>👆</span><span tabindex='25'>🖕</span>
          <span tabindex='26'>👇</span><span tabindex='27'>☝️</span><span tabindex='28'>👍</span>
          <span tabindex='29'>👎</span><span tabindex='30'>✊</span>
        </p>

        <p>
          <span tabindex='31'>👊</span><span tabindex='32'>🤛</span><span tabindex='33'>🤜</span>
          <span tabindex='34'>👏</span><span tabindex='35'>🫶</span>
          <span tabindex='36'>🙌</span><span tabindex='37'>👐</span><span tabindex='38'>🤲</span>
          <span tabindex='39'>🤝</span><span tabindex='40'>🙏</span>
        </p>

        <p>
          <span tabindex='41'>✍️</span><span tabindex='42'>💅</span><span tabindex='43'>🤳</span>
          <span tabindex='44'>💪</span><span tabindex='45'>🦾</span>
          <span tabindex='46'>🦵</span><span tabindex='47'>🦿</span><span tabindex='48'>🦶</span>
          <span tabindex='49'>👣</span><span tabindex='50'>👂</span>
        </p>

        <p>
          <span tabindex='51'>🦻</span><span tabindex='52'>👃</span><span tabindex='53'>🫀</span>
          <span tabindex='54'>🫁</span><span tabindex='55'>🧠</span>
          <span tabindex='56'>🦷</span><span tabindex='57'>🦴</span><span tabindex='58'>👀</span>
          <span tabindex='59'>👁</span><span tabindex='60'>👅</span>
        </p>

        <p>
          <span tabindex='61'>👄</span><span tabindex='62'>🫦</span><span tabindex='63'>💋</span>
          <span tabindex='64'>🩸</span>
        </p>

      </div>
    </TabPanel>

  </TabView>

</template>

<script setup lang='ts'>
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const emits = defineEmits(['insertEmoji']);
const { t } = useI18n();
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    focusCurrentEmojiPlus(10);
  }
  if (e.key === 'ArrowUp') {
    focusCurrentEmojiPlus(-10);
  }
  if (e.key === 'ArrowRight') {
    focusCurrentEmojiPlus(1);
  }
  if (e.key === 'ArrowLeft') {
    focusCurrentEmojiPlus(-1);
  }
}

function handleEnter() {
  const element = document.activeElement as HTMLElement;
  if (element?.nodeName === 'SPAN') {
    element?.click();
  }
}

function focusWhenChangeTab() {
  setTimeout(() => {
    focusEmoji(1);
  }, 100);
}

function focusCurrentEmojiPlus(value: number) {
  const element = document.activeElement as HTMLElement;
  if (element?.nodeName === 'SPAN') {
    const currentTabIndex = element?.tabIndex;
    focusEmoji(currentTabIndex + value);
  }
}

function focusEmoji(index: number) {
  const element = document.querySelector<HTMLElement>(`[data-p-active="true"] .emoji p span[tabindex="${ index }"]`);
  element?.focus();
}

onMounted(() => {
  document.querySelectorAll<HTMLElement>('.emoji p span').forEach(
    (e) => {
      e.addEventListener('click', () => {
        emits('insertEmoji', e.innerHTML);
      });
    }
  );
  focusEmoji(1);
});
</script>

<script lang='ts'>
export default { name: 'ChatEmoji' };
</script>

<style lang='scss'>
.emoji {
  p {
    span {
      font-family: Segoe UI Emoji, emoji;
      cursor: pointer;

      &:focus-visible {
        outline: 1px solid var(--primary-color);
      }
    }
  }
}

.p-tabview {
  .p-tabview-panels {
    padding: .5rem 0;
  }
}
</style>