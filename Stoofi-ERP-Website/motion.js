(() => {
  const root=document.documentElement;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)');
  const toggle=document.querySelector('.motion-toggle');
  let paused=reduced.matches;
  document.querySelectorAll('.feature').forEach(card=>card.dataset.tilt='3');
  const tiltItems=[...document.querySelectorAll('[data-tilt]')];
  function resetTilt(){tiltItems.forEach(el=>el.style.removeProperty('transform'))}
  function applyPreference(){
    root.classList.toggle('motion-paused',paused||reduced.matches);
    root.classList.toggle('motion-stagger',!paused&&!reduced.matches);
    toggle.setAttribute('aria-pressed',String(paused||reduced.matches));
    const label=reduced.matches?'Animations disabled by device preference':paused?'Resume animations':'Pause animations';
    toggle.setAttribute('aria-label',label);toggle.title=label;
    toggle.querySelector('.sr-only').textContent=label;
    toggle.querySelector('svg').innerHTML=(paused||reduced.matches)?'<path d="m7 4 8 6-8 6Z" stroke-width="1.5"/>':'<path d="M7 5v10m6-10v10"/>';
    toggle.disabled=reduced.matches;
    if(paused||reduced.matches)resetTilt();
  }
  toggle.addEventListener('click',()=>{paused=!paused;applyPreference()});
  reduced.addEventListener('change',()=>{paused=reduced.matches;applyPreference()});
  finePointer.addEventListener('change',resetTilt);
  applyPreference();
  document.querySelectorAll('.feature-grid,.portal-grid,.testimonial-grid,.pricing-grid').forEach(grid=>{
    [...grid.children].forEach((el,i)=>el.style.setProperty('--reveal-delay',`${(i%3)*80}ms`));
  });
  tiltItems.forEach(el=>{
    let frame=0;
    const reset=()=>{cancelAnimationFrame(frame);frame=0;el.style.removeProperty('transform')};
    el.addEventListener('pointermove',event=>{
      if(paused||reduced.matches||!finePointer.matches||event.pointerType==='touch')return;
      const bounds=el.getBoundingClientRect();
      const x=Math.max(-.5,Math.min(.5,(event.clientX-bounds.left)/bounds.width-.5));
      const y=Math.max(-.5,Math.min(.5,(event.clientY-bounds.top)/bounds.height-.5));
      const depth=Number(el.dataset.tilt)||4;
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{
        if(paused||reduced.matches||!finePointer.matches)return;
        el.style.transform=`perspective(1100px) rotateX(${-y*depth}deg) rotateY(${x*depth}deg) translateY(-3px)`;
      });
    },{passive:true});
    el.addEventListener('pointerleave',reset);
    el.addEventListener('pointercancel',reset);
    el.addEventListener('focusout',reset);
  });
})();
