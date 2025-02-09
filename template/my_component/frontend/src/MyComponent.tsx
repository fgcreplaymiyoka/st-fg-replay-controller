import {
  Streamlit,
  withStreamlitConnection,
  ComponentProps,
} from "streamlit-component-lib"
import React, { useCallback, useEffect, useMemo, useRef, useState, ReactElement } from "react"
import VideoJS from "./VideoJS"
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';

/**
 * This is a React-based component template. The passed props are coming from the 
 * Streamlit library. Your custom args can be accessed via the `args` props.
 */
function MyComponent({ args, disabled, theme }: ComponentProps): ReactElement {
  const { video_url } = args

  console.log("video_url", video_url)
  const playerRef = React.useRef<Player | null>(null);
  const playPauseButtonRef = useRef<HTMLButtonElement | null>(null);
  const videoJsOptions = {
    autoplay: 'muted',
    controls: true,
    responsive: true,
    fluid: true,
    playsinline: true,
    sources: [{
      src: video_url,
      type: 'video/mp4'
    }]
  };

  const [isFocused, setIsFocused] = useState(false)
  const [numClicks, setNumClicks] = useState(0)

  const style: React.CSSProperties = useMemo(() => {
    if (!theme) return {}

    // Use the theme object to style our button border. Alternatively, the
    // theme style is defined in CSS vars.
    const borderStyling = `1px solid ${isFocused ? theme.primaryColor : "gray"}`
    return { border: borderStyling, outline: borderStyling }
  }, [theme, isFocused])

  const handlePlayerReady = (player: Player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on('waiting', () => {
      videojs.log('player is waiting');
    });

    player.on('dispose', () => {
      videojs.log('player will dispose');
    });

    player.on('play', function () {
      playPauseButtonRef.current!.innerHTML = "pause";
    });

    player.on('pause', function () {
      playPauseButtonRef.current!.innerHTML = "play";
    });
  };

  useEffect(() => {
    Streamlit.setComponentValue(numClicks)
  }, [numClicks])

  // setFrameHeight should be called on first render and evertime the size might change (e.g. due to a DOM update).
  // Adding the style and theme here since they might effect the visual size of the component.
  useEffect(() => {
    Streamlit.setFrameHeight()
  }, [style, theme])

  /** Click handler for our "Click Me!" button. */
  const onClicked = useCallback((): void => {
    // setNumClicks((prevNumClicks) => prevNumClicks + 1)
    if (playerRef.current?.paused()) {
      playerRef.current?.play();
    } else {
      playerRef.current?.pause();
    }
  }, [])

  const movePosition = useCallback((seconds: number): void => {
    const player = playerRef.current;
    if (player) {
      var currentTime = player?.currentTime() ?? 0
      player.currentTime(currentTime + seconds);
    }
  }, []);

  /** Focus handler for our "Click Me!" button. */
  const onFocus = useCallback((): void => {
    setIsFocused(true)
  }, [])

  /** Blur handler for our "Click Me!" button. */
  const onBlur = useCallback((): void => {
    setIsFocused(false)
  }, [])

  // Show a button and some text.
  // When the button is clicked, we'll increment our "numClicks" state
  // variable, and send its new value back to Streamlit, where it'll
  // be available to the Python program.
  // return (
  //   <span>
  //     Hello, {video_url}! &nbsp;
  //     <button
  //       style={style}
  //       onClick={onClicked}
  //       disabled={disabled}
  //       onFocus={onFocus}
  //       onBlur={onBlur}
  //     >
  //       Click Me!
  //     </button>
  //   </span>
  // )
  // return (
  //   <span>
  //     Hello, {video_url}! &nbsp;
  //   </span>
  // )
  return (
    <>
      <div>Rest of app here</div>
      <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
      <button ref={playPauseButtonRef} onClick={onClicked}>Play</button>
      <button onClick={() => movePosition(-5)}>-5 sec</button>
      <button onClick={() => movePosition(-1)}>-1 sec</button>
      <button onClick={() => movePosition(-0.016)}>-1 frame</button>
      <button onClick={() => movePosition(0.016)}>+1 frame</button>
      <button onClick={() => movePosition(1)}>+1 sec</button>
      <button onClick={() => movePosition(5)}>+5 sec</button>
    </>
  );
}

// "withStreamlitConnection" is a wrapper function. It bootstraps the
// connection between your component and the Streamlit app, and handles
// passing arguments from Python -> Component.
//
// You don't need to edit withStreamlitConnection (but you're welcome to!).
export default withStreamlitConnection(MyComponent)
