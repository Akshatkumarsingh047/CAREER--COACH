"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import VideoBackground from "./shared/VideoBackground";
import { Pointer } from "@/components/magicui/pointer";
import { AuroraText } from "@/components/magicui/aurora-text";
import { RainbowButton } from "@/components/magicui/rainbow-button";

import { dark } from "@clerk/themes";
import Earth from "./globe";

  
const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  return (
    <section className="w-full pt-36 md:pt-48 pb-10">
      <Pointer>
            <div className="text-2xl">👆</div>
          </Pointer>
      <div className="space-y-6 text-center">
        <VideoBackground
                videoSrc="/videos/bg-video4.mp4"
                fallbackImageSrc="/herobg.jpg"
                
              />
        <div className=" space-y-6 mx-auto">
        <span > <Earth className="h-64 w-64 opacity-75  -my-12"/> </span>
          
          <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl gradient-title animate-gradient">
            Your AI <AuroraText> Career Elevate</AuroraText> for
            <br />
            Professional Success 

          </h1>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
            Advance your career with personalized guidance, interview prep, and
            AI-powered tools for job success.
          </p>
        </div>
        <div className="flex justify-center space-x-4">
          <Link href="/dashboard">
            <RainbowButton size="lg" className="px-8 text-lg hover:bg-blue-400 animate-bounce">
              Get Started
            </RainbowButton>
          </Link>
          
        </div>
        <div className="hero-image-wrapper mt-5 md:mt-0">
          <div ref={imageRef} className="hero-image">
            <Image
              src="/banner2.jpeg"
              width={1280}
              height={720}
              alt="Dashboard Preview"
              className="rounded-lg shadow-2xl border mx-auto saturate-150"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
