import { createContext, useContext, useEffect, useRef } from "react";

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const sounds = {
    // click: useRef(null),
    chatPage:useRef(null),
    gamePage:useRef(null),
    walletPage:useRef(null),
    profilePage:useRef(null),
    mainPage:useRef(null),
    // win: useRef(null),
    // lose: useRef(null),
    // dice: useRef(null),
  };

  // 🔓 iOS audio unlock (1 dəfə)
  useEffect(() => {
    const unlock = () => {
      Object.values(sounds).forEach(ref => {
        if (!ref.current) return;
        ref.current.play()
          .then(() => {
            ref.current.pause();
            ref.current.currentTime = 0;
          })
          .catch(() => {});
      });
    };

    document.addEventListener("click", unlock, { once: true });
    return () => document.removeEventListener("click", unlock);
  }, []);

  const playSound = (name) => {
    const ref = sounds[name];
    if (!ref?.current) return;
    ref.current.currentTime = 0;
    ref.current.play().catch(() => {});
  };

  return (
    <SoundContext.Provider value={{ playSound }}>
      {/* 🔊 AUDIO TAGS */}
      {/* <audio ref={sounds.click} preload="auto" src="/sounds/clickPageSwitch.mp3" /> */}
      <audio ref={sounds.mainPage} preload="auto" src="/sounds/mainPage.mp3" />
      <audio ref={sounds.profilePage} preload="auto" src="/sounds/profilePage.mp3" />
      <audio ref={sounds.chatPage} preload="auto" src="/sounds/chatPage.mp3" />
      <audio ref={sounds.walletPage} preload="auto" src="/sounds/walletPage.mp3" />
      <audio ref={sounds.gamePage} preload="auto" src="/sounds/gamePage.mp3" />

      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
