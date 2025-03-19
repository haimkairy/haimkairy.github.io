// Populate the playlist
function populatePlaylist() {
  const playlistWrapper = document.getElementById('playlist-wrapper');
  playlistWrapper.innerHTML = ''; // Clear existing content

  songTracks.forEach((track, index) => {
      const songWrapper = document.createElement('div');
      songWrapper.className = 'song-wrapper';
      songWrapper.dataset.songFile = track.songFile; // Attach the song file to the element

      const songNumber = document.createElement('div');
      songNumber.className = 'song-number';
      songNumber.textContent = index + 1; // Song number starts from 1

      const songTitle = document.createElement('div');
      songTitle.className = 'song-title';
      songTitle.textContent = track.songTitle;

      const songDuration = document.createElement('div');
      songDuration.className = 'song-duration';
      songDuration.textContent = track.songDuration;

      songWrapper.appendChild(songNumber);
      songWrapper.appendChild(songTitle);
      songWrapper.appendChild(songDuration);

      // Add click event to play the song
      songWrapper.addEventListener('click', () => playSong(track.songFile));

      playlistWrapper.appendChild(songWrapper);
  });
}


function toggleAudioMeter(songWrapper, show) {
  const songNumber = songWrapper.querySelector('.song-number');
  if (show) {
      // Replace song number with an animated meter
      songNumber.innerHTML = `
          <div class="audio-meter">
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
          </div>
      `;
  } else {
      // Restore the original song number
      const index = Array.from(songWrapper.parentNode.children).indexOf(songWrapper);
      songNumber.textContent = index + 1;
  }
}

let audioPlayer = new Audio(); // Create a global audio player

// Function to play a song
function playSong(songFile) {
  const playlistWrapper = document.getElementById('playlist-wrapper');
  const allSongs = Array.from(playlistWrapper.getElementsByClassName('song-wrapper'));

  // Clear existing audio meters
  allSongs.forEach(song => toggleAudioMeter(song, false));

  // Find the clicked song
  const songWrapper = allSongs.find(song => song.dataset.songFile === songFile);

  if (audioPlayer.src !== songFile) {
      audioPlayer.src = songFile;
      currentTrackIndex = songTracks.findIndex(track => track.songFile === songFile);
      document.getElementById('player-title').textContent = songTracks[currentTrackIndex].songTitle;
  }

  audioPlayer.play();
  isPlaying = true;
  toggleAudioMeter(songWrapper, true); // Show the audio meter
  updatePlayButton();
}

audioPlayer.addEventListener('pause', () => {
  const playlistWrapper = document.getElementById('playlist-wrapper');
  const allSongs = Array.from(playlistWrapper.getElementsByClassName('song-wrapper'));
  toggleAudioMeter(allSongs[currentTrackIndex], false); // Restore song number
});

// Adjust playlist height
function adjustPlaylistHeight() {
  const topBar = document.getElementById('top-bar-wrapper');
  const albumInfo = document.getElementById('album-info-wrapper');
  const playlistWrapper = document.getElementById('playlist-wrapper');
  const player = document.getElementById('player');

  const availableHeight = window.innerHeight - albumInfo.offsetHeight - player.offsetHeight + topBar.offsetHeight;
  playlistWrapper.style.height = `${availableHeight}px`;
}


let currentTrackIndex = 0;
audioPlayer = new Audio(songTracks[currentTrackIndex].songFile);
let isPlaying = false;

// Play or pause the current track
document.getElementById('play-button').addEventListener('click', togglePlayPause);
document.getElementById('prev-button').addEventListener('click', playPreviousTrack);
document.getElementById('next-button').addEventListener('click', playNextTrack);

function togglePlayPause() {
  const playlistWrapper = document.getElementById('playlist-wrapper');
  const allSongs = Array.from(playlistWrapper.getElementsByClassName('song-wrapper'));
  const currentSongWrapper = allSongs[currentTrackIndex];

  if (isPlaying) {
      audioPlayer.pause();
      toggleAudioMeter(currentSongWrapper, false); // Hide meter when paused
  } else {
      // If the audio source isn't set, initialize it with the first track
      if (!audioPlayer.src) {
          audioPlayer.src = songTracks[currentTrackIndex].songFile;
          document.getElementById('player-title').textContent = songTracks[currentTrackIndex].songTitle;
      }
      audioPlayer.play();
      toggleAudioMeter(currentSongWrapper, true); // Show meter when playing
  }
  isPlaying = !isPlaying;
  updatePlayButton();
}

function updatePlayButton() {
  const playButton = document.getElementById('play-button');
  // Clear existing content
  playButton.innerHTML = '';
  
  // Create and add the appropriate image
  const img = document.createElement('img');
  img.src = isPlaying ? 'images/pause-but.png' : 'images/play-but.png';
  img.alt = isPlaying ? 'Pause' : 'Play';
  playButton.appendChild(img);
}

function playPreviousTrack() {
  const playlistWrapper = document.getElementById('playlist-wrapper');
  const allSongs = Array.from(playlistWrapper.getElementsByClassName('song-wrapper'));

  // Clear existing audio meters
  allSongs.forEach(song => toggleAudioMeter(song, false));

  // Move to the previous track
  currentTrackIndex = (currentTrackIndex - 1 + songTracks.length) % songTracks.length;

  // Load and play the new track
  loadTrack();
  toggleAudioMeter(allSongs[currentTrackIndex], true); // Show the audio meter for the new track
}

function playNextTrack() {
  const playlistWrapper = document.getElementById('playlist-wrapper');
  const allSongs = Array.from(playlistWrapper.getElementsByClassName('song-wrapper'));

  // Clear existing audio meters
  allSongs.forEach(song => toggleAudioMeter(song, false));

  // Move to the next track
  currentTrackIndex = (currentTrackIndex + 1) % songTracks.length;

  // Load and play the new track
  loadTrack();
  toggleAudioMeter(allSongs[currentTrackIndex], true); // Show the audio meter for the new track
}

function loadTrack() {
  const playlistWrapper = document.getElementById('playlist-wrapper');
  const allSongs = Array.from(playlistWrapper.getElementsByClassName('song-wrapper'));

  // Set the audio player source
  audioPlayer.src = songTracks[currentTrackIndex].songFile;
  document.getElementById('player-title').textContent = songTracks[currentTrackIndex].songTitle;

  // Clear all meters and show the current track's meter
  allSongs.forEach(song => toggleAudioMeter(song, false));
  toggleAudioMeter(allSongs[currentTrackIndex], true);

  // Play the track and update the play button
  audioPlayer.play();
  isPlaying = true;
  updatePlayButton();
}

// Progress bar and time display
audioPlayer.addEventListener('timeupdate', updateProgress);

// Add click event listener to progress bar
document.getElementById('progress-bar').addEventListener('click', seekTo);

function seekTo(event) {
    const progressBar = document.getElementById('progress-bar');
    const bounds = progressBar.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const width = bounds.width;
    const percentage = x / width;
    
    // Calculate the time to seek to
    const timeToSeek = percentage * audioPlayer.duration;
    
    // Set the current time of the audio player
    if (!isNaN(timeToSeek) && isFinite(timeToSeek)) {
        audioPlayer.currentTime = timeToSeek;
        // Update the progress bar visually
        const progress = document.getElementById('progress');
        progress.style.width = `${percentage * 100}%`;
    }
}

function updateProgress() {
  const progress = document.getElementById('progress');
  const timeInfo = document.getElementById('time-info');
  const progressBar = document.getElementById('progress-bar');

  const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progress.style.width = `${percentage}%`;
  const currentTime = formatTime(audioPlayer.currentTime);
  const duration = formatTime(audioPlayer.duration || 0);
  timeInfo.textContent = `${currentTime} / ${duration}`;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${sec}`;
}

// Initialize play button on page load
document.addEventListener('DOMContentLoaded', () => {
  populatePlaylist();
  adjustPlaylistHeight();
  updatePlayButton();

  // Initialize the audio meter for the first track
  const playlistWrapper = document.getElementById('playlist-wrapper');
  const allSongs = Array.from(playlistWrapper.getElementsByClassName('song-wrapper'));

  // Highlight the first track's meter if playback starts
  if (allSongs.length > 0) {
      toggleAudioMeter(allSongs[currentTrackIndex], false); // Ensure no meter on load
  }

  const volumeFader = document.getElementById('volume-fader');

  // Set the initial volume
  audioPlayer.volume = parseFloat(volumeFader.value);

  // Update the audio player's volume when the fader value changes
  volumeFader.addEventListener('input', (event) => {
      audioPlayer.volume = parseFloat(event.target.value);
  });


});

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
      event.preventDefault(); // Prevent the page from scrolling down
      togglePlayPause();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const playButton = document.getElementById('start-play-button');

  playButton.addEventListener('click', () => {
      const playlistWrapper = document.getElementById('playlist-wrapper');
      const allSongs = Array.from(playlistWrapper.getElementsByClassName('song-wrapper'));

      if (songTracks.length > 0) {
          currentTrackIndex = 0; // Ensure the first track is selected
          audioPlayer.src = songTracks[currentTrackIndex].songFile; // Set the first track as the source
          document.getElementById('player-title').textContent = songTracks[currentTrackIndex].songTitle;

          // Play the first track
          audioPlayer.play();
          isPlaying = true;

          // Update the play button state
          updatePlayButton();

          // Toggle the audio meter for the first track
          allSongs.forEach(song => toggleAudioMeter(song, false)); // Clear existing meters
          toggleAudioMeter(allSongs[currentTrackIndex], true); // Show meter for the first track
      }
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const playlistWrapper = document.getElementById('playlist-wrapper');
  const allSongs = Array.from(playlistWrapper.getElementsByClassName('song-wrapper'));

  // Play the next track when the current one ends
  audioPlayer.addEventListener('ended', () => {
      // Increment the track index, wrapping around to the start if needed
      currentTrackIndex = (currentTrackIndex + 1) % songTracks.length;

      // Load and play the next track
      audioPlayer.src = songTracks[currentTrackIndex].songFile;
      document.getElementById('player-title').textContent = songTracks[currentTrackIndex].songTitle;
      audioPlayer.play();
      isPlaying = true;

      // Update the play button state
      updatePlayButton();

      // Update audio meters
      allSongs.forEach(song => toggleAudioMeter(song, false)); // Clear existing meters
      toggleAudioMeter(allSongs[currentTrackIndex], true); // Show meter for the next track
  });
});

function updateTrackInfo() {
  const tracksInfoElement = document.getElementById('tracks-info');

  // Total number of tracks
  const totalTracks = songTracks.length;

  // Calculate total duration in seconds
  const totalDurationInSeconds = songTracks.reduce((total, track) => {
      const [minutes, seconds] = track.songDuration.split(':').map(Number);
      return total + minutes * 60 + seconds;
  }, 0);

  // Convert total duration to minutes and seconds
  const totalMinutes = Math.floor(totalDurationInSeconds / 60);
  const totalSeconds = totalDurationInSeconds % 60;

  // Update the text content of the tracks-info element
  tracksInfoElement.textContent = `${totalTracks} Tracks, ${totalMinutes}m ${totalSeconds}s`;
}
document.addEventListener('DOMContentLoaded', () => {
  populatePlaylist();
  adjustPlaylistHeight();
  updatePlayButton();

  // Update the dynamic track information
  updateTrackInfo();
});


window.addEventListener('load', adjustPlaylistHeight);
window.addEventListener('resize', adjustPlaylistHeight);