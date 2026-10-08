// 스크롤하면 섹션 카드가 부드럽게 나타나게 합니다. 움직임 줄이기 설정이면 건너뜁니다.
(() => {
  const targets = document.querySelectorAll(
    ".journey li, .chapter, .pull, .ability-card, .tile, .calendar, .work, .doc-card, .summary-item, .strength-card, .aleph-task, .evidence-card, .scope-card"
  );
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.documentElement.classList.add("reveal-ready");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  targets.forEach((el, i) => {
    el.style.setProperty("--reveal-delay", `${(i % 4) * 70}ms`);
    observer.observe(el);
  });
})();
