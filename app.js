// Estado global de la app
let loadedSongs = [];
let currentSongIndex = -1;
let isPlaying = false;
let isShuffle = false;
let playlists = {};

// Elementos DOM
const folderInput = document.getElementById('folderInput');
const btnSelectFolder = document.getElementById('btnSelectFolder');
const songListEl = document.getElementById('songList');
const songCountEl = document.getElementById('songCount');

const audioElement = document.getElementById('audioElement');
const currentTitle = document.getElementById('currentTitle');
const currentArtist = document.getElementById('currentArtist');
const currentTimeEl = document.getElementById('currentTime');
const durationTimeEl = document.getElementById('durationTime');
const progressBar = document.getElementById('progressBar');
const volumeBar = document.getElementById('volumeBar');

const btnPlayPause = document.getElementById('btnPlayPause');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const btnShuffle = document.getElementById('btnShuffle');

const tabFiles = document.getElementById('tabFiles');
const tabPlaylists = document.getElementById('tabPlaylists');
const viewFiles = document.getElementById('viewFiles');
const viewPlaylists = document.getElementById('viewPlaylists');
const btnCreatePlaylist = document.getElementById('btnCreatePlaylist');
const newPlaylistName = document.getElementById('newPlaylistName');
const playlistsContainer = document.getElementById('playlistsContainer');

// Selección de Carpetas Locales
btnSelectFolder.addEventListener('click', () => folderInput.click());

folderInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);

  // Filtrar archivos de audio
  loadedSongs = files.filter(file => 
    file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac)$/i.test(file.name)
  );

  songCountEl.textContent = loadedSongs.length;
  renderSongList();

  if (loadedSongs.length > 0) {
    loadSong(0);
  }
});

// Renderizar la lista de canciones en interfaz
function renderSongList() {
  songListEl.innerHTML = '';
  if (loadedSongs.length === 0) {
    songListEl.innerHTML = '<li class="empty-msg">No se encontraron archivos de audio en la carpeta.</li>';
    return;
  }

  loadedSongs.forEach((song, index) => {
    const li = document.createElement('li');
    li.className = `track-item ${index === currentSongIndex ? 'active' : ''}`;
    
    const titleSpan = document.createElement('span');
    titleSpan.textContent = song.name.replace(/\.[^/.]+$/, "");
    titleSpan.addEventListener('click', () => {
      loadSong(index);
      playSong();
    });

    const addBtn = document.createElement('button');
    addBtn.textContent = '+ Lista';
    addBtn.className = 'btn btn-secondary';
    addBtn.style.padding = '2px 6px';
    addBtn.style.fontSize = '0.75rem';
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToPlaylistPrompt(song);
    });

    li.appendChild(titleSpan);
    li.appendChild(addBtn);
    songListEl.appendChild(li);
  });
}

// Cargar canción seleccionada en la memoria
function loadSong(index) {
  if (index < 0 || index >= loadedSongs.length) return;
  currentSongIndex = index;
  const song = loadedSongs[index];

  audioElement.src = URL.createObjectURL(song);
  currentTitle.textContent = song.name.replace(/\.[^/.]+$/, "");
  currentArtist.textContent = song.webkitRelativePath || "Archivo Local";

  renderSongList();
}

// Control de reproducción y pausa
function playSong() {
  if (currentSongIndex === -1 && loadedSongs.length > 0) loadSong(0);
  audioElement.play();
  isPlaying = true;
  btnPlayPause.textContent = '⏸';
}

function pauseSong() {
  audioElement.pause();
  isPlaying = false;
  btnPlayPause.textContent = '▶';
}

btnPlayPause.addEventListener('click', () => {
  isPlaying ? pauseSong() : playSong();
});

// Modo Aleatorio (Shuffle)
btnShuffle.addEventListener('click', () => {
  isShuffle = !isShuffle;
  btnShuffle.classList.toggle('active', isShuffle);
});

function getNextSongIndex() {
  if (loadedSongs.length <= 1) return 0;

  if (isShuffle) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * loadedSongs.length);
    } while (randomIndex === currentSongIndex);
    return randomIndex;
  } else {
    return (currentSongIndex + 1) % loadedSongs.length;
  }
}

btnNext.addEventListener('click', () => {
  if (loadedSongs.length === 0) return;
  const nextIndex = getNextSongIndex();
  loadSong(nextIndex);
  playSong();
});

btnPrev.addEventListener('click', () => {
  if (loadedSongs.length === 0) return;
  const prevIndex = (currentSongIndex - 1 + loadedSongs.length) % loadedSongs.length;
  loadSong(prevIndex);
  playSong();
});

// Actualización de tiempos y barra de reproducción
audioElement.addEventListener('timeupdate', () => {
  if (audioElement.duration) {
    const progress = (audioElement.currentTime / audioElement.duration) * 100;
    progressBar.value = progress;
    currentTimeEl.textContent = formatTime(audioElement.currentTime);
    durationTimeEl.textContent = formatTime(audioElement.duration);
  }
});

progressBar.addEventListener('input', () => {
  if (audioElement.duration) {
    audioElement.currentTime = (progressBar.value / 100) * audioElement.duration;
  }
});

volumeBar.addEventListener('input', (e) => {
  audioElement.volume = e.target.value / 100;
});

audioElement.addEventListener('ended', () => {
  btnNext.click();
});

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Control de Pestañas
tabFiles.addEventListener('click', () => {
  tabFiles.classList.add('active');
  tabPlaylists.classList.remove('active');
  viewFiles.classList.add('active');
  viewPlaylists.classList.remove('active');
});

tabPlaylists.addEventListener('click', () => {
  tabPlaylists.classList.add('active');
  tabFiles.classList.remove('active');
  viewPlaylists.classList.add('active');
  viewFiles.classList.remove('active');
});

// Gestión de Listas de Reproducción
btnCreatePlaylist.addEventListener('click', () => {
  const name = newPlaylistName.value.trim();
  if (name && !playlists[name]) {
    playlists[name] = [];
    newPlaylistName.value = '';
    renderPlaylists();
  }
});

function addToPlaylistPrompt(song) {
  const playlistNames = Object.keys(playlists);
  if (playlistNames.length === 0) {
    alert('Primero crea una lista de reproducción en la pestaña "Listas de Reproducción".');
    return;
  }
  const choice = prompt(`Añadir "${song.name}" a:\nListas: ${playlistNames.join(', ')}`);
  if (choice && playlists[choice]) {
    playlists[choice].push(song);
    renderPlaylists();
    alert(`Canción añadida a "${choice}"`);
  }
}

function renderPlaylists() {
  playlistsContainer.innerHTML = '';
  const names = Object.keys(playlists);

  if (names.length === 0) {
    playlistsContainer.innerHTML = '<p class="empty-msg">No has creado listas de reproducción.</p>';
    return;
  }

  names.forEach(name => {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    card.innerHTML = `
      <h4>${name} (${playlists[name].length} canciones)</h4>
    `;
    playlistsContainer.appendChild(card);
  });
} 