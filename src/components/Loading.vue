<template>
  <div class="loading-wrapper">
    <p>Loading {{Math.round(progress)}}%</p>
    <h6>click anywhere to enable sound</h6>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    progress: Number,
  },
}
</script>

<style scoped lang="scss">

.loading-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  height: 100dvh;
  width: 100dvw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: "SometypeMono", sans-serif;
  z-index: 5;
  transition: opacity 2.5s ease-in-out;

  p {
    position: relative;
    width: fit-content;
    font-size: 30px;
    color: white;
    opacity: 0.5;

    @media screen and (max-width: 576px) {
      font-size: 20px;
    }

  }

  h6 {
    position: relative;
    margin-top: 20px;
    width: fit-content;
    font-size: 18px;
    color: white;
    opacity: 0.35;

    @media screen and (max-width: 576px) {
      font-size: 12px;
    }

  }

}

</style>