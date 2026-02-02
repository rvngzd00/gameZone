import { createContext, useContext, useRef, useState } from "react";
import { Howl } from "howler";

const SoundContext = createContext();

const sounds = {
    click: new Howl({
        src: ["/Sounds/clickPageSwitch.mp3"],
        volume: 0.7,
    }),
    profileOpen: new Howl({
        src: ["/Sounds/profilePage.mp3"],
        volume: 0.7,
    }),
    mainOpen: new Howl({
        src: ["/Sounds/mainPage.mp3"],
        volume: 0.4,
    }),
    walletOpen: new Howl({
        src: ["/Sounds/walletPage.mp3"],
        volume: 0.7,
    }),
    chatOpen: new Howl({
        src: ["/Sounds/chatPage.mp3"],
        volume: 0.7,
    }),
    gamesOpen: new Howl({
        src: ["/Sounds/gamePage.mp3"],
        volume: 0.7,
    }),
};

export function SoundProvider({ children }) {
    const [enabled, setEnabled] = useState(true);
    const unlocked = useRef(false);

   


    const play = (name) => {
        if (!enabled) return;
        sounds[name]?.play();
    };

    const playSequence = (list) => {
        if (!enabled) return;
        let delay = 0;

        list.forEach(({ name, wait = 0 }) => {
            setTimeout(() => {
                sounds[name]?.play();
            }, delay);

            delay += wait;
        });
    };

    return (
        <SoundContext.Provider
            value={{
                play,
                playSequence,
                enabled,
                setEnabled,
            }}
        >
            {children}
        </SoundContext.Provider>
    );

}

export const useSound = () => useContext(SoundContext);
