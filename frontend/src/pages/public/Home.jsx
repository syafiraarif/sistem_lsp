
import React, { useEffect } from "react";
import Hero from "../../components/hero/Hero";
import Statistics from "../../components/statistics/Statistics";
import AssessorList from "../../components/assessors/AssessorList";
import TukList from "../../components/tuk/TukList";
import LatestUpdates from "../../components/updates/LatestUpdates";

export default function Home() {
useEffect(() => {
  const target = sessionStorage.getItem("simlsp-home-scroll-target");

  const SCROLL_OFFSETS = {
    "assessor-section": 1,
    "tuk-section": -400,
  };

  let firstFrame;
  let secondFrame;

  firstFrame = requestAnimationFrame(() => {
    secondFrame = requestAnimationFrame(() => {
      const section = target
        ? document.getElementById(target)
        : null;

      if (section) {
        const offset = SCROLL_OFFSETS[target] || 150;

        const sectionPosition =
          section.getBoundingClientRect().top + window.scrollY;

        window.scrollTo({
          top: Math.max(0, sectionPosition - offset),
          behavior: "smooth",
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }

      if (target) {
        sessionStorage.removeItem("simlsp-home-scroll-target");
      }
    });
  });

  return () => {
    cancelAnimationFrame(firstFrame);
    cancelAnimationFrame(secondFrame);
  };
}, []);

  return (
    <>
      <Hero />
      <Statistics />
      <AssessorList />
      <TukList />
      <LatestUpdates />
    </>
  );
}
