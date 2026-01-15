import { DRACOLoader } from "/WebsiteFYP/libs/three.js-r132/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "/WebsiteFYP/libs/three.js-r132/examples/jsm/loaders/GLTFLoader.js";

const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener("DOMContentLoaded", async () => {

  // ================= 1. UI BUTTONS (BACK BUTTON) =================
  function createGameButton(htmlContent, positionStyles, mainColor, shadowColor) {
    const btn = document.createElement("button");
    btn.innerHTML = htmlContent;
    Object.assign(btn.style, {
      position: "absolute", width: "65px", height: "65px",
      borderRadius: "50%", border: "4px solid #ffffff",
      background: mainColor, boxShadow: `0px 6px 0px ${shadowColor}, 0px 8px 10px rgba(0,0,0,0.4)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", zIndex: "1000", transition: "transform 0.1s, box-shadow 0.1s", outline: "none",
      ...positionStyles
    });
    btn.addEventListener("mousedown", () => { btn.style.transform = "translateY(6px)"; btn.style.boxShadow = `0px 0px 0px ${shadowColor}`; });
    btn.addEventListener("mouseup", () => { btn.style.transform = "translateY(0px)"; btn.style.boxShadow = `0px 6px 0px ${shadowColor}, 0px 8px 10px rgba(0,0,0,0.4)`; });
    btn.addEventListener("touchstart", () => { btn.style.transform = "translateY(6px)"; btn.style.boxShadow = `0px 0px 0px ${shadowColor}`; });
    btn.addEventListener("touchend", () => { btn.style.transform = "translateY(0px)"; btn.style.boxShadow = `0px 6px 0px ${shadowColor}, 0px 8px 10px rgba(0,0,0,0.4)`; });
    document.body.appendChild(btn);
    return btn;
  }

  const backBtn = createGameButton(
    `<svg viewBox="0 0 24 24" width="32" height="32" fill="#5c2e00" stroke="#5c2e00" stroke-width="1"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>`, 
    { top: "20px", left: "20px" }, "linear-gradient(to bottom, #FFCC00 0%, #FF9900 100%)", "#b35900"
  );
  backBtn.addEventListener("click", () => { window.location.href = "/WebsiteFYP/rumah.html"; });


  // ================= 2. MINDAR SETUP (MOD STABIL MAKSIMUM) =================
  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "/WebsiteFYP/assets/targets/house.mind", 
    filterMinCF: 0.00001, 
    filterBeta: 0.0001,   
    warmupTolerance: 5,   
    missTolerance: 10     
  });
   
  const { renderer, scene, camera } = mindarThree;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1));
  const anchor = mindarThree.addAnchor(0);


  // ================= 3. AUDIO SYSTEM =================
  const listener = new THREE.AudioListener();
  camera.add(listener);
  const audioLoader = new THREE.AudioLoader();

  const bgMusic = new THREE.Audio(listener);
  audioLoader.load("/WebsiteFYP/assets/sound/Muzikbertitik.mp3", (buffer) => {
    bgMusic.setBuffer(buffer); bgMusic.setLoop(true); bgMusic.setVolume(0.1);
  });

  const narrativeAudio = new THREE.Audio(listener);
  audioLoader.load("/WebsiteFYP/assets/sound/rumahbajau.mp3", (buffer) => {
    narrativeAudio.setBuffer(buffer); narrativeAudio.setLoop(false); narrativeAudio.setVolume(1.0);
  });

  let isNarrativePlaying = false;

  function toggleNarrative() {
      if (listener.context.state === 'suspended') listener.context.resume();
      if (isNarrativePlaying) {
          narrativeAudio.pause();
          bgMusic.setVolume(0.3); 
          isNarrativePlaying = false;
          return false; 
      } else {
          narrativeAudio.play();
          bgMusic.setVolume(0.1); 
          isNarrativePlaying = true;
          return true; 
      }
  }

  anchor.onTargetFound = () => { if (!bgMusic.isPlaying) bgMusic.play(); };
  anchor.onTargetLost = () => {
    if (bgMusic.isPlaying) bgMusic.pause();
    narrativeAudio.pause();
    isNarrativePlaying = false;
  };


  // ================= 4. VIDEO AR SYSTEM =================
  const videoEl = document.createElement("video");
  videoEl.src = "/WebsiteFYP/assets/videos/rumah.mp4"; 
  videoEl.crossOrigin = "anonymous";
  videoEl.loop = true;
  videoEl.playsInline = true; 
  videoEl.webkitPlaysInline = true;
  videoEl.style.display = "none";
  document.body.appendChild(videoEl);

  function createARVideoScreen() {
      const videoTexture = new THREE.VideoTexture(videoEl);
      const videoGeo = new THREE.PlaneGeometry(1.0, 0.56); 
      const videoMat = new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide });
      const videoMesh = new THREE.Mesh(videoGeo, videoMat);
      
      const frameGeo = new THREE.PlaneGeometry(1.05, 0.61); 
      const frameMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      frameMesh.position.z = -0.01; 
      videoMesh.add(frameMesh); 

      videoMesh.position.set(-1.1, 0.4, 0.3); 
      videoMesh.scale.set(0, 0, 0);
      videoMesh.visible = false; 
      videoMesh.userData = { currentScale: 0, targetScale: 0 };

      return videoMesh;
  }
  const arVideoScreen = createARVideoScreen();
  anchor.group.add(arVideoScreen);


  // ================= 5. FUNGSI LABEL & AUDIO BUTTON (SPEAKER BULAT) =================
  function createFancyLabelWithButton() {
    const text = "Rumah tradisional Bajau Samah dibina menggunakan bahan semula jadi seperti buluh dan kayu keras dan sengaja dijarak-jarakkan untuk memudahkan tuan rumah memantau haiwan ternakan mereka seperti kuda dan kerbau yang diletakkan di bawah kolong rumah.";

    // --- A. Canvas Teks (Panel Utama) ---
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const canvasWidth = 1024;
    const padding = 60; 
    const titleHeight = 160; 
    const lineHeight = 70;   
    const maxTextWidth = canvasWidth - (padding * 2);

    ctx.font = "45px Arial"; 
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
      let testLine = currentLine + " " + words[i];
      let metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth) {
        lines.push(currentLine); currentLine = words[i];
      } else { currentLine = testLine; }
    }
    lines.push(currentLine); 

    const buttonAreaHeight = 180; // Lebihkan sikit ruang bawah untuk butang bulat
    const contentHeight = titleHeight + (lines.length * lineHeight) + padding + buttonAreaHeight;
    canvas.width = canvasWidth; canvas.height = contentHeight; 

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)"; ctx.strokeStyle = "#FFCC00"; ctx.lineWidth = 15;
    const x = 10, y = 10, w = canvasWidth - 20, h = contentHeight - 20, r = 60;
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    ctx.font = "bold 80px Arial"; ctx.fillStyle = "#FFCC00"; ctx.textAlign = "center";
    ctx.fillText("RUMAH TRADISIONAL", canvasWidth / 2, 120);
    ctx.font = "45px Arial"; ctx.fillStyle = "white";
    let lineY = titleHeight + 40; 
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], canvasWidth / 2, lineY); lineY += lineHeight;
    }

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const meshWidth = 0.8; 
    const meshHeight = meshWidth * (canvas.height / canvas.width); 
    const panelMesh = new THREE.Mesh(new THREE.PlaneGeometry(meshWidth, meshHeight), material);
    
    panelMesh.position.set(0.9, 0.3, 0); 
    panelMesh.scale.set(0, 0, 0); 
    panelMesh.userData = { currentScale: 0, targetScale: 0, type: "panel" };

    // --- B. Buat Button Audio Bulat (Speaker Icon) ---
    // Guna CircleGeometry untuk bentuk bulat
    const btnRadius = 0.07;
    const btnGeo = new THREE.CircleGeometry(btnRadius, 32);
    
    // Canvas untuk lukis icon speaker
    const btnCanvas = document.createElement('canvas');
    btnCanvas.width = 128; btnCanvas.height = 128;
    const bCtx = btnCanvas.getContext('2d');
    
    // 1. Background Hijau Bulat
    bCtx.fillStyle = "#4CAF50";
    bCtx.beginPath();
    bCtx.arc(64, 64, 64, 0, Math.PI * 2);
    bCtx.fill();

    // 2. Lukis Icon Speaker Putih (Guna Path)
    bCtx.fillStyle = "white";
    bCtx.beginPath();
    bCtx.moveTo(35, 50); bCtx.lineTo(35, 78); bCtx.lineTo(55, 78);
    bCtx.lineTo(80, 100); bCtx.lineTo(80, 28); bCtx.lineTo(55, 50);
    bCtx.closePath(); bCtx.fill();

    // 3. Lukis Gelombang Bunyi (Sound Waves)
    bCtx.strokeStyle = "white"; bCtx.lineWidth = 6; bCtx.lineCap = 'round';
    bCtx.beginPath(); bCtx.arc(85, 64, 20, -Math.PI/3, Math.PI/3); bCtx.stroke(); // Wave 1
    bCtx.beginPath(); bCtx.arc(95, 64, 30, -Math.PI/3, Math.PI/3); bCtx.stroke(); // Wave 2
    
    const btnTex = new THREE.CanvasTexture(btnCanvas);
    const btnMat = new THREE.MeshBasicMaterial({ map: btnTex, transparent: true });
    const audioBtnMesh = new THREE.Mesh(btnGeo, btnMat);
    
    // Posisi di bahagian bawah panel
    audioBtnMesh.position.set(0, -meshHeight/2 + 0.1, 0.02); 
    audioBtnMesh.userData = { type: "audioBtn" }; 

    panelMesh.add(audioBtnMesh); 
    return { panelMesh, audioBtnMesh }; 
  }

  const { panelMesh: infoLabel, audioBtnMesh } = createFancyLabelWithButton();
  anchor.group.add(infoLabel);


  // ================= 6. BUTANG VIDEO (ASING & JAUH DARI MODEL) =================
  function createIsolatedVideoButton() {
      const geometry = new THREE.CircleGeometry(0.08, 32);
      const material = new THREE.MeshBasicMaterial({ color: 0xFF5722, side: THREE.DoubleSide });
      const buttonMesh = new THREE.Mesh(geometry, material);
      
      buttonMesh.position.set(-0.5, -0.3, 0.3);
      buttonMesh.rotation.x = -Math.PI / 6; 

      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = "#FF5722"; ctx.fillRect(0,0,256,128); 
      ctx.fillStyle = "white"; ctx.font = "bold 60px Arial"; ctx.textAlign = "center";
      ctx.fillText("TOUR", 128, 85);
      
      const texture = new THREE.CanvasTexture(canvas);
      const textGeo = new THREE.PlaneGeometry(0.16, 0.08);
      const textMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const textMesh = new THREE.Mesh(textGeo, textMat);
      textMesh.position.set(0, 0, 0.02); 
      
      buttonMesh.add(textMesh);
      
      buttonMesh.userData = { originalY: -0.3, clock: new THREE.Clock(), type: "videoButton" };
      return buttonMesh;
  }
  const videoButton = createIsolatedVideoButton();
  anchor.group.add(videoButton);


  // ================= 7. LOAD MODEL =================
  const dLoader = new DRACOLoader();
  dLoader.setDecoderPath("/WebsiteFYP/libs/draco/");
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dLoader);

  const gltf = await gltfLoader.loadAsync("/WebsiteFYP/assets/models/rumahTEST.glb");
  const model = gltf.scene;
  model.scale.set(0.8, 0.8, 0.8);
  model.position.set(0, -0.4, 0);
  model.userData = { type: "house" }; 
  anchor.group.add(model);        


  // ================= 8. INTERACTION (ROTATION) =================
  let isDragging = false;
  let previousX = 0, previousY = 0;
  const minX = -Math.PI / 6, maxX = Math.PI / 6;  

  window.addEventListener("pointerdown", (e) => {
    if (e.target.closest('button')) return; 
    isDragging = true; previousX = e.clientX; previousY = e.clientY;
  });
  window.addEventListener("pointerup", () => isDragging = false);
  window.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousX;
    const deltaY = e.clientY - previousY;
    model.rotation.y += deltaX * 0.01;
    model.rotation.x += deltaY * 0.01;
    model.rotation.x = Math.max(minX, Math.min(maxX, model.rotation.x));
    previousX = e.clientX; previousY = e.clientY;
  });
  window.addEventListener("wheel", (e) => {
      e.preventDefault();
      let scale = model.scale.x - e.deltaY * 0.001;
      scale = Math.min(Math.max(scale, 0.3), 2);
      model.scale.setScalar(scale);
  }, { passive: false });


  // ================= 9. CLICK LOGIC =================
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let labelTimer;

  window.addEventListener("pointerup", (e) => {
    if (isDragging && (Math.abs(e.clientX - previousX) > 5)) return;
    if (e.target.closest('button')) return;

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    
    const objectsToTest = [model, videoButton, audioBtnMesh]; 
    const hits = raycaster.intersectObjects(objectsToTest, true);

    if (hits.length > 0) {
       let object = hits[0].object;
       while(object.parent && !object.userData.type) { object = object.parent; }
       const type = object.userData.type;

       if (type === "videoButton") {
           if (arVideoScreen.userData.targetScale === 0) {
               arVideoScreen.visible = true;
               arVideoScreen.userData.targetScale = 1;
               videoEl.play();
           } else {
               arVideoScreen.userData.targetScale = 0;
               videoEl.pause();
           }
       } 
       else if (type === "audioBtn") {
           toggleNarrative();
       }
       else if (type === "house") {
           infoLabel.userData.targetScale = 1;
           clearTimeout(labelTimer);
           labelTimer = setTimeout(() => { infoLabel.userData.targetScale = 0; }, 10000);
       }
    }
  });


  // ================= 10. ANIMATION LOOP =================
  await mindarThree.start();
   
  renderer.setAnimationLoop(() => {
    const speed = 0.1;

    if (infoLabel) {
      infoLabel.userData.currentScale += (infoLabel.userData.targetScale - infoLabel.userData.currentScale) * speed;
      const s = infoLabel.userData.currentScale;
      if (s < 0.01) {
          infoLabel.visible = false;
      } else {
          infoLabel.visible = true;
          infoLabel.scale.set(s, s, s);
      }
      infoLabel.lookAt(camera.position);
    }

    if (arVideoScreen) {
        arVideoScreen.userData.currentScale += (arVideoScreen.userData.targetScale - arVideoScreen.userData.currentScale) * speed;
        const vs = arVideoScreen.userData.currentScale;
        if (vs < 0.01) {
            arVideoScreen.visible = false;
        } else {
            arVideoScreen.visible = true;
            arVideoScreen.scale.set(vs, vs, vs);
        }
        arVideoScreen.lookAt(camera.position);
    }

    if (videoButton) {
        const time = videoButton.userData.clock.getElapsedTime();
        videoButton.position.y = videoButton.userData.originalY + Math.sin(time * 2) * 0.02; 
        videoButton.lookAt(camera.position);
    }

    renderer.render(scene, camera);
  });

});