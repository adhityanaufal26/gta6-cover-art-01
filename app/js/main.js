// Neon Palm Cover Studio — boot and screenshot scenes.
// Normal open: full editor with the two sample photos already loaded.
// ?shot=cover&photo=pier&caption=Sunset Heist renders only the exported
// cover full-frame (layout, grade, size and subtitle params also accepted).
// ?shot=editor&photo=boulevard&caption=Boulevard Queen renders the editor
// with that photo loaded and caption set.

import { createEditor } from './editor.js';
import { renderCover, sizeById } from './cover-engine.js';

function collectElements() {
  const byId = (id) => document.getElementById(id);
  return {
    canvas: byId('coverCanvas'),
    dropZone: byId('previewWrap'),
    fileInput: byId('fileInput'),
    thumbs: byId('photoThumbs'),
    photoCount: byId('photoCount'),
    layoutPicker: byId('layoutPicker'),
    gradePicker: byId('gradePicker'),
    sizePicker: byId('sizePicker'),
    titleInput: byId('titleInput'),
    subtitleInput: byId('subtitleInput'),
    taglineInput: byId('taglineInput'),
    billingInput: byId('billingInput'),
    calloutInput: byId('calloutInput'),
    zoomRange: byId('zoomRange'),
    rotRange: byId('rotRange'),
    starsRange: byId('starsRange'),
    sealToggle: byId('sealToggle'),
    grainToggle: byId('grainToggle'),
    vignetteToggle: byId('vignetteToggle'),
    halftoneToggle: byId('halftoneToggle'),
    panelLabel: byId('panelLabel'),
    prevPanelBtn: byId('prevPanelBtn'),
    nextPanelBtn: byId('nextPanelBtn'),
    fillBtn: byId('fillBtn'),
    undoBtn: byId('undoBtn'),
    redoBtn: byId('redoBtn'),
    exportBtn: byId('exportBtn'),
    exportAllBtn: byId('exportAllBtn'),
    sizeReadout: byId('sizeReadout'),
    status: byId('statusLine'),
  };
}

async function bootEditor(editor, params) {
  editor.bindControls();
  editor.bindCanvasPointer();
  await editor.loadSamplePhotos();
  editor.applyShotParams(params);
  editor.syncControls();
  editor.pushHistory();
  editor.renderPreview();
  window.__shotReady = true;
}

async function bootCoverShot(editor, params) {
  document.body.classList.add('shot-cover');
  await editor.loadSamplePhotos();
  editor.applyShotParams(params);
  const size = sizeById(editor.state.size);
  const canvas = document.getElementById('coverCanvas');
  canvas.width = size.w;
  canvas.height = size.h;
  renderCover(canvas.getContext('2d'), editor.state, editor.photos, size.w, size.h, { selected: -1 });
  window.__shotReady = true;
}

async function boot() {
  const params = new URLSearchParams(window.location.search);
  const editor = createEditor(collectElements());
  if (params.get('shot') === 'cover') {
    await bootCoverShot(editor, params);
  } else {
    await bootEditor(editor, params);
  }
}

boot();
