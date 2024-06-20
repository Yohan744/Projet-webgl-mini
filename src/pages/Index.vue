<template>

  <main ref="experienceWrapper" id="experienceWrapper">

    <Loading v-if="!isLoaded" v-bind:class="{visible: !isLoaded }" :progress="progress"/>

    <div ref="experienceContainer" class="experience"></div>

  </main>
</template>

<script>
import Experience from '../experience/Experience';
import Loading from "../components/Loading.vue";
import {useRouter} from "vue-router";
import {useSoundManager} from "../main";
import {useGameManager} from "../assets/js/GameManager";
import gsap from "gsap";
import {isMobile} from "../assets/js/utils";
import {useGlobalEvents} from "../assets/js/GlobalEvents";

export default {
  name: 'ExperiencePage',
  components: {Loading},
  data() {
    const gameManager = useGameManager();
    const globalEvents = useGlobalEvents();
    const router = useRouter();

    return {
      gameManager,
      globalEvents,
      router,
      routeCheck: false,
      isLoaded: false,
      experience: null,
      soundManager: useSoundManager,
      progress: 0,
      showStartButton: false,
      showVideoOutro: false,
    };
  },
  mounted() {

    this.$nextTick(() => {
      this.initExperience();
    });
  },
  beforeUnmount() {
    if (this.experience) {
      this.experience.destroy();
      this.experience = null;
    }
  },
  methods: {
    isMobile,
    initExperience() {
      if (this.experience) {
        this.experience.destroy();
        this.experience = null;
      }

      this.experience = new Experience({
        targetElement: this.$refs.experienceContainer
      });

      this.soundManager?.play('background');

      this.experience.resources.on('ready', () => {
        this.isLoaded = true;
        this.setExperienceOpacity();
      });

      this.experience.on('assetLoading', (value) => {
        const p = Math.min(Math.round(value * 100), 100);
        if (p > this.progress) {
          gsap.to(this, {
            progress: p,
            duration: 0.5,
            ease: 'power2.out'
          });
        }
      });
    },
    setExperienceOpacity() {
      if (this.$refs.experienceContainer) {
        this.gameManager.setExperienceVisible();
        this.$refs.experienceContainer.style.opacity = 1;
        this.showStartButton = false;
      }
    },
  },
}
</script>
