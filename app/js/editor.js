// Neon Palm Cover Studio — editor: state, photo loading, panel controls,
// undo/redo, live preview and one-click PNG export in four post sizes.

import {
  COVER_SIZES, LAYOUTS, GRADES,
  createCoverState, layoutPanels, renderCover, panelAtPoint,
  sizeById, layoutById,
} from './cover-engine.js';

export function createEditor(els) {
  const state = createCoverState();
  const photos = [];
  let selectedPanel = 0;
  let lastGeo = null;
  let history = [];
  let historyIndex = -1;
  let renderQueued = false;

  function snapshotState() {
    return JSON.stringify(state);
  }

  function pushHistory() {
    const snap = snapshotState();
    if (history[historyIndex] === snap) return;
    history = history.slice(0, historyIndex + 1);
    history.push(snap);
    if (history.length > 60) history.shift();
    historyIndex = history.length - 1;
    syncUndoButtons();
  }

  function restoreHistory(index) {
    if (index < 0 || index >= history.length) return;
    const parsed = JSON.parse(history[index]);
    Object.assign(state, parsed);
    historyIndex = index;
    syncControls();
    renderPreview();
    syncUndoButtons();
  }

  function undo() { restoreHistory(historyIndex - 1); }
  function redo() { restoreHistory(historyIndex + 1); }

  function syncUndoButtons() {
    if (els.undoBtn) els.undoBtn.disabled = historyIndex <= 0;
    if (els.redoBtn) els.redoBtn.disabled = historyIndex >= history.length - 1;
  }

  function previewSize() {
    const size = sizeById(state.size);
    const scale = Math.min(1, 1080 / Math.max(size.w, size.h));
    return { w: Math.round(size.w * scale), h: Math.round(size.h * scale) };
  }

  function renderPreview() {
    const { w, h } = previewSize();
    if (els.canvas.width !== w || els.canvas.height !== h) {
      els.canvas.width = w;
      els.canvas.height = h;
    }
    const ctx = els.canvas.getContext('2d');
    lastGeo = renderCover(ctx, state, photos, w, h, { selected: selectedPanel });
    if (els.sizeReadout) {
      const size = sizeById(state.size);
      els.sizeReadout.textContent = size.label + ' PNG - ' + layoutById(state.layout).label;
    }
  }

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      renderPreview();
    });
  }

  function loadPhotoFromUrl(url, name) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        photos.push({ img, name });
        resolve(photos.length - 1);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async function loadSamplePhotos() {
    await loadPhotoFromUrl('samples/boulevard.jpg', 'boulevard.jpg');
    await loadPhotoFromUrl('samples/pier.jpg', 'pier.jpg');
    renderThumbs();
    renderPreview();
  }

  function addPhotoFiles(files) {
    const list = Array.from(files || []).filter((f) => f.type && f.type.startsWith('image/'));
    if (!list.length) return;
    let pending = list.length;
    list.forEach((file) => {
      const url = URL.createObjectURL(file);
      loadPhotoFromUrl(url, file.name).then(() => {
        pending -= 1;
        if (pending === 0) {
          pushHistory();
          renderThumbs();
          renderPreview();
        }
      }).catch(() => {
        pending -= 1;
        if (pending === 0) { renderThumbs(); renderPreview(); }
      });
    });
  }

  function renderThumbs() {
    if (!els.thumbs) return;
    els.thumbs.innerHTML = '';
    photos.forEach((photo, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'thumb' + (state.panels[selectedPanel] && state.panels[selectedPanel].photo === i ? ' active' : '');
      btn.title = 'Use ' + photo.name + ' in panel ' + (selectedPanel + 1);
      const img = document.createElement('img');
      img.src = photo.img.src;
      img.alt = photo.name;
      const cap = document.createElement('span');
      cap.textContent = photo.name;
      btn.appendChild(img);
      btn.appendChild(cap);
      btn.addEventListener('click', () => {
        state.panels[selectedPanel].photo = i;
        pushHistory();
        renderThumbs();
        renderPreview();
      });
      els.thumbs.appendChild(btn);
    });
    if (els.photoCount) {
      els.photoCount.textContent = photos.length + (photos.length === 1 ? ' photo loaded' : ' photos loaded');
    }
  }

  function fillPanelsFromPhotos() {
    if (!photos.length) return;
    state.panels.forEach((panel, i) => {
      panel.photo = i % photos.length;
    });
    pushHistory();
    renderThumbs();
    renderPreview();
  }

  function syncPanelControls() {
    const panel = state.panels[selectedPanel];
    if (!panel) return;
    if (els.zoomRange) els.zoomRange.value = String(panel.zoom);
    if (els.rotRange) els.rotRange.value = String(panel.rot || 0);
    if (els.calloutInput) els.calloutInput.value = panel.callout || '';
    if (els.panelLabel) {
      els.panelLabel.textContent = 'Panel ' + (selectedPanel + 1) + ' of ' + layoutById(state.layout).panels;
    }
  }

  function selectPanel(index) {
    const count = layoutById(state.layout).panels;
    selectedPanel = Math.max(0, Math.min(count - 1, index));
    syncPanelControls();
    renderThumbs();
    renderPreview();
  }

  function canvasPoint(event) {
    const rect = els.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (els.canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (els.canvas.height / rect.height);
    return { x, y };
  }

  function bindCanvasPointer() {
    let dragging = false;
    let last = null;
    els.canvas.addEventListener('pointerdown', (event) => {
      const p = canvasPoint(event);
      const geo = lastGeo || layoutPanels(state.layout, els.canvas.width, els.canvas.height);
      const hit = panelAtPoint(geo, p.x, p.y);
      if (hit >= 0) {
        selectPanel(hit);
        dragging = true;
        last = p;
        els.canvas.setPointerCapture(event.pointerId);
      }
    });
    els.canvas.addEventListener('pointermove', (event) => {
      if (!dragging || !last) return;
      const p = canvasPoint(event);
      const panel = state.panels[selectedPanel];
      const rect = (lastGeo || layoutPanels(state.layout, els.canvas.width, els.canvas.height)).panels[selectedPanel];
      if (panel && rect) {
        panel.x = Math.max(0, Math.min(1, panel.x - (p.x - last.x) / rect.w * 0.9));
        panel.y = Math.max(0, Math.min(1, panel.y - (p.y - last.y) / rect.h * 0.9));
        queueRender();
      }
      last = p;
    });
    const endDrag = () => {
      if (dragging) pushHistory();
      dragging = false;
      last = null;
    };
    els.canvas.addEventListener('pointerup', endDrag);
    els.canvas.addEventListener('pointercancel', endDrag);
    els.canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      const panel = state.panels[selectedPanel];
      if (!panel) return;
      panel.zoom = Math.max(1, Math.min(3.2, panel.zoom * (event.deltaY < 0 ? 1.07 : 0.93)));
      syncPanelControls();
      queueRender();
    }, { passive: false });
  }

  function buildPicker(container, items, activeId, onPick, className) {
    if (!container) return;
    container.innerHTML = '';
    items.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = className + (item.id === activeId ? ' active' : '');
      btn.textContent = item.label;
      btn.dataset.id = item.id;
      btn.addEventListener('click', () => onPick(item.id));
      container.appendChild(btn);
    });
  }

  function syncControls() {
    buildPicker(els.layoutPicker, LAYOUTS, state.layout, (id) => {
      state.layout = id;
      if (selectedPanel >= layoutById(id).panels) selectedPanel = 0;
      pushHistory();
      syncControls();
      renderPreview();
    }, 'pick layout-pick');
    buildPicker(els.gradePicker, GRADES, state.grade, (id) => {
      state.grade = id;
      pushHistory();
      syncControls();
      renderPreview();
    }, 'pick grade-pick');
    buildPicker(els.sizePicker, COVER_SIZES, state.size, (id) => {
      state.size = id;
      pushHistory();
      syncControls();
      renderPreview();
    }, 'pick size-pick');
    if (els.titleInput) els.titleInput.value = state.title;
    if (els.subtitleInput) els.subtitleInput.value = state.subtitle;
    if (els.taglineInput) els.taglineInput.value = state.tagline;
    if (els.billingInput) els.billingInput.value = state.billing;
    if (els.starsRange) els.starsRange.value = String(state.stars);
    if (els.sealToggle) els.sealToggle.checked = !!state.seal;
    if (els.grainToggle) els.grainToggle.checked = !!state.grain;
    if (els.vignetteToggle) els.vignetteToggle.checked = !!state.vignette;
    if (els.halftoneToggle) els.halftoneToggle.checked = !!state.halftone;
    syncPanelControls();
  }

  function bindControls() {
    const textBind = (input, key) => {
      if (!input) return;
      input.addEventListener('input', () => {
        state[key] = input.value;
        queueRender();
      });
      input.addEventListener('change', pushHistory);
    };
    textBind(els.titleInput, 'title');
    textBind(els.subtitleInput, 'subtitle');
    textBind(els.taglineInput, 'tagline');
    textBind(els.billingInput, 'billing');
    if (els.calloutInput) {
      els.calloutInput.addEventListener('input', () => {
        state.panels[selectedPanel].callout = els.calloutInput.value;
        queueRender();
      });
      els.calloutInput.addEventListener('change', pushHistory);
    }
    if (els.zoomRange) {
      els.zoomRange.addEventListener('input', () => {
        state.panels[selectedPanel].zoom = Number(els.zoomRange.value);
        queueRender();
      });
      els.zoomRange.addEventListener('change', pushHistory);
    }
    if (els.rotRange) {
      els.rotRange.addEventListener('input', () => {
        state.panels[selectedPanel].rot = Number(els.rotRange.value);
        queueRender();
      });
      els.rotRange.addEventListener('change', pushHistory);
    }
    if (els.starsRange) {
      els.starsRange.addEventListener('input', () => {
        state.stars = Number(els.starsRange.value);
        queueRender();
      });
      els.starsRange.addEventListener('change', pushHistory);
    }
    const toggleBind = (input, key) => {
      if (!input) return;
      input.addEventListener('change', () => {
        state[key] = input.checked;
        pushHistory();
        renderPreview();
      });
    };
    toggleBind(els.sealToggle, 'seal');
    toggleBind(els.grainToggle, 'grain');
    toggleBind(els.vignetteToggle, 'vignette');
    toggleBind(els.halftoneToggle, 'halftone');

    if (els.fileInput) {
      els.fileInput.addEventListener('change', () => addPhotoFiles(els.fileInput.files));
    }
    if (els.fillBtn) els.fillBtn.addEventListener('click', fillPanelsFromPhotos);
    if (els.undoBtn) els.undoBtn.addEventListener('click', undo);
    if (els.redoBtn) els.redoBtn.addEventListener('click', redo);
    if (els.prevPanelBtn) els.prevPanelBtn.addEventListener('click', () => selectPanel(selectedPanel - 1));
    if (els.nextPanelBtn) els.nextPanelBtn.addEventListener('click', () => selectPanel(selectedPanel + 1));
    if (els.exportBtn) els.exportBtn.addEventListener('click', () => exportPng(state.size));
    if (els.exportAllBtn) els.exportAllBtn.addEventListener('click', exportAllSizes);

    const dropZone = els.dropZone || els.canvas;
    ['dragenter', 'dragover'].forEach((name) => dropZone.addEventListener(name, (event) => {
      event.preventDefault();
      dropZone.classList.add('dragging');
    }));
    ['dragleave', 'drop'].forEach((name) => dropZone.addEventListener(name, (event) => {
      event.preventDefault();
      dropZone.classList.remove('dragging');
    }));
    dropZone.addEventListener('drop', (event) => {
      if (event.dataTransfer) addPhotoFiles(event.dataTransfer.files);
    });

    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo(); else undo();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
      }
    });
  }

  function renderExportCanvas(sizeId) {
    const size = sizeById(sizeId);
    const off = document.createElement('canvas');
    off.width = size.w;
    off.height = size.h;
    renderCover(off.getContext('2d'), state, photos, size.w, size.h, { selected: -1 });
    return off;
  }

  function downloadCanvas(canvas, filename) {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    }, 'image/png');
  }

  function exportPng(sizeId) {
    const size = sizeById(sizeId);
    const slug = String(state.title || 'cover').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'cover';
    downloadCanvas(renderExportCanvas(sizeId), slug + '-' + size.w + 'x' + size.h + '.png');
    if (els.status) els.status.textContent = 'Exported ' + size.label + ' PNG.';
  }

  function exportAllSizes() {
    COVER_SIZES.forEach((size, i) => {
      setTimeout(() => exportPng(size.id), i * 450);
    });
    if (els.status) els.status.textContent = 'Exporting all four sizes...';
  }

  function applyShotParams(params) {
    const photo = params.get('photo');
    const caption = params.get('caption');
    const subtitle = params.get('subtitle');
    const layout = params.get('layout');
    const grade = params.get('grade');
    const size = params.get('size');
    if (caption) state.title = caption;
    if (subtitle) state.subtitle = subtitle;
    if (layout && LAYOUTS.some((l) => l.id === layout)) state.layout = layout;
    if (grade && GRADES.some((g) => g.id === grade)) state.grade = grade;
    if (size) {
      const byDims = COVER_SIZES.find((s) => s.w + 'x' + s.h === size);
      if (byDims) state.size = byDims.id;
      else if (COVER_SIZES.some((s) => s.id === size)) state.size = size;
    }
    if (photo === 'pier' || photo === 'boulevard') {
      const first = photo === 'pier' ? 1 : 0;
      state.panels.forEach((panel, i) => {
        panel.photo = (first + i) % 2;
      });
    }
  }

  return {
    state,
    photos,
    loadSamplePhotos,
    renderPreview,
    renderExportCanvas,
    syncControls,
    bindControls,
    bindCanvasPointer,
    applyShotParams,
    pushHistory,
    selectPanel,
  };
}
