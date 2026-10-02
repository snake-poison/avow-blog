<script setup lang="ts">
// The share card for every page: kicker, title, the Avow mark. Built from Avow's landing card
// (components/OgImage/Avow.satori.vue there) and its light tokens, which Satori cannot read
// from CSS; keep them in step with layers/ui/app/assets/css/tokens.css.
const props = withDefaults(defineProps<{
  title?: string
  kicker?: string
}>(), {
  title: 'Avow Blog',
  kicker: 'Avow Blog',
})

const paper = '#f4efe7'
const paper2 = '#fffbf3'
const ink = '#17181c'
const inkSoft = '#4a505d'
const rule = 'rgba(23, 24, 28, 0.16)'
const accent = '#0c7054'

const heading = 'Archivo Narrow'
const mono = 'IBM Plex Mono'

// Long titles step down so they stay inside the card.
const titleSize = props.title.length > 70 ? '64px' : props.title.length > 40 ? '76px' : '92px'
</script>

<template>
  <div
    :style="{
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '60px 72px 52px',
      color: ink,
      fontFamily: heading,
      backgroundColor: paper,
      backgroundImage: `radial-gradient(circle at 92% -6%, rgba(12,112,84,0.16), transparent 46%), radial-gradient(circle at -4% 108%, rgba(11,107,168,0.10), transparent 40%), linear-gradient(180deg, ${paper2}, ${paper})`,
    }"
  >
    <span
      :style="{
        position: 'absolute',
        top: '20px',
        left: '20px',
        right: '20px',
        bottom: '20px',
        border: `1px solid ${rule}`,
        borderRadius: '18px',
        display: 'flex',
      }"
    />

    <div :style="{ display: 'flex', flexDirection: 'column' }">
      <div :style="{ display: 'flex', alignItems: 'center', gap: '14px' }">
        <span
          :style="{
            display: 'flex',
            width: '12px',
            height: '12px',
            borderRadius: '6px',
            backgroundColor: accent,
            boxShadow: '0 0 0 6px rgba(12,112,84,0.16)',
          }"
        />
        <span
          :style="{
            display: 'flex',
            fontFamily: mono,
            fontWeight: 600,
            fontSize: '19px',
            letterSpacing: '0.18em',
            color: accent,
          }"
        >
          {{ props.kicker.toUpperCase() }}
        </span>
      </div>

      <div
        :style="{
          display: 'flex',
          marginTop: '30px',
          width: '1000px',
          fontFamily: heading,
          fontWeight: 700,
          fontSize: titleSize,
          lineHeight: 1,
          letterSpacing: '-0.015em',
        }"
      >
        {{ props.title }}
      </div>
    </div>

    <div :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }">
      <span :style="{ display: 'flex', alignItems: 'center', gap: '14px' }">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1152 1090" :style="{ width: '46px', height: '44px' }">
          <path :fill="ink" d="M1004.2 538.1 806.4 423.9l13.7-23.7 184.1 106.2z" />
          <path :fill="ink" d="M650.5 666.6V282.1L605.3 256v718.2l45.2-26V721.6h-31.8zm93.2-168.7V173.8l-45.3-26.1v526.2l27.6 47.7h-27.6v198.9l45.3-26V545.8H716zm47.9-113.7v106.7l31.7 54.9h-31.7v320.8l45.3-26.2V409.8zM567.1 943.3 282.6 779.1V450.5l284.5-164.2v-31.7L255.2 434.7V795l311.9 180.1z" />
          <path :fill="ink" d="m567.1 270.1-6.7-11.6-416 240.1.2 31.6 422.5-243.9z" />
        </svg>
        <span :style="{ display: 'flex', fontFamily: heading, fontWeight: 700, fontSize: '38px', letterSpacing: '0.01em' }">Avow</span>
      </span>
      <span
        :style="{
          display: 'flex',
          fontFamily: mono,
          fontWeight: 500,
          fontSize: '18px',
          letterSpacing: '0.14em',
          color: inkSoft,
        }"
      >
        ITSAVOW.COM
      </span>
    </div>
  </div>
</template>
