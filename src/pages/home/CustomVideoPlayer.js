import React, { useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import Video from "react-native-video";
import Slider from "@react-native-community/slider";

export default function CustomVideoPlayer({ videoUrl }) {
  const videoRef = useRef(null);

  const [paused, setPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [buffering, setBuffering] = useState(false);

  const onLoad = (data) => {
    setDuration(data.duration);
  };

  const onProgress = (data) => {
    if (!isSeeking) {
      setPosition(data.currentTime);
    }
  };

  const onSeek = (value) => {
    setIsSeeking(false);
    videoRef.current.seek(value);
    setPosition(value);
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={styles.video}
        paused={paused}
        resizeMode="contain"
        onLoad={onLoad}
        onProgress={onProgress}
        onBuffer={() => setBuffering(true)}
        onReadyForDisplay={() => setBuffering(false)}
      />

      {/* Play / Pause Button */}
      <TouchableOpacity
        style={styles.playButton}
        onPress={() => setPaused(!paused)}
      >
        <Text style={{ color: "white", fontSize: 18 }}>
          {paused ? "Play" : "Pause"}
        </Text>
      </TouchableOpacity>

      {/* Slider */}
      <View style={styles.sliderContainer}>
        <Slider
          style={{ width: "90%" }}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#FFFFFF"
          thumbTintColor="#1DB954"
          onSlidingStart={() => setIsSeeking(true)}
          onSlidingComplete={onSeek}
        />

        {/* Timestamp */}
        <Text style={styles.time}>
          {formatTime(position)} / {formatTime(duration)}
        </Text>
      </View>

      {/* Buffering Indicator */}
      {buffering && (
        <Text style={styles.bufferingText}>Buffering...</Text>
      )}
    </View>
  );
}

function formatTime(sec) {
  if (!sec) return "0:00";
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "black",
  },
  video: {
    width: "100%",
    height: 300,
    backgroundColor: "black",
  },
  playButton: {
    padding: 12,
    backgroundColor: "#333",
    marginTop: 10,
    alignSelf: "center",
    borderRadius: 8,
  },
  sliderContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  time: {
    color: "white",
    marginTop: 6,
  },
  bufferingText: {
    color: "yellow",
    textAlign: "center",
    marginTop: 10,
  },
});
