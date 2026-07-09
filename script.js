window.addEventListener('scroll', () => {
  document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);

  const frame = document.querySelector('.scroll-frame-image');
  if (frame) {
    const scrollTop = window.scrollY;
    const revealPoint = 5000;
    frame.style.opacity = scrollTop > revealPoint ? '1' : '0';
  }
});
