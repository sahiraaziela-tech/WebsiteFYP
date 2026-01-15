import { DRACOLoader } from "/WebsiteFYP/libs/three.js-r132/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "/WebsiteFYP/libs/three.js-r132/examples/jsm/loaders/GLTFLoader.js";

const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener("DOMContentLoaded", async () => {

  // ================= 1. MINDAR SETUP =================
  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "/WebsiteFYP/assets/targets/pakaian.mind",
  });

  const { renderer, scene, camera } = mindarThree;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.2));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  const anchor = mindarThree.addAnchor(0);


  // ================= 2. AUDIO SYSTEM =================
  const listener = new THREE.AudioListener();
  camera.add(listener);

  const audioLoader = new THREE.AudioLoader();
  const bgMusic = new THREE.Audio(listener);
  
  // NOTE: Narrative Audio dikekalkan jika anda mahu pasang pada AR button nanti, 
  // tapi buat masa ini tiada butang untuk play ini.
  const narrativeAudio = new THREE.Audio(listener); 

  // Load Background Music
  audioLoader.load("/WebsiteFYP/assets/sound/Muzikbertitik.mp3", (buffer) => {
    bgMusic.setBuffer(buffer);
    bgMusic.setLoop(true);
    bgMusic.setVolume(0.1); 
  });

  // Load Naratif Utama
  audioLoader.load("/WebsiteFYP/assets/sound/NaratifRumah.mp3", (buffer) => {
    narrativeAudio.setBuffer(buffer);
    narrativeAudio.setLoop(false);
    narrativeAudio.setVolume(1.0);
  });

  const audioMap = {
    Mandapun: new Audio("/WebsiteFYP/assets/sound/MandapunL.mp3"),
    Tanjak: new Audio("/WebsiteFYP/assets/sound/TanjakL.mp3"),
    Ingkot_Pangkat: new Audio("/WebsiteFYP/assets/sound/Ingkot pangkatL.mp3"),
    Salempang: new Audio("/WebsiteFYP/assets/sound/SalempangL.mp3"),
    Samping: new Audio("/WebsiteFYP/assets/sound/SupuL.mp3"), 
  };
  Object.values(audioMap).forEach(a => { a.volume = 1.0; a.preload = "auto"; });

  function stopAllInfoAudio() {
    Object.values(audioMap).forEach(a => { a.pause(); a.currentTime = 0; });
  }


  // ================= 3. UI BUTTONS (HANYA BACK BUTTON) =================
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

  // Back Button
  const backBtn = createGameButton(
    `<svg viewBox="0 0 24 24" width="32" height="32" fill="#5c2e00" stroke="#5c2e00" stroke-width="1"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>`, 
    { top: "20px", left: "20px" }, "linear-gradient(to bottom, #FFCC00 0%, #FF9900 100%)", "#b35900"
  );
  backBtn.addEventListener("click", () => { window.location.href = "/WebsiteFYP/pakaian.html"; });

  // [DIHAPUS] Kod butang speaker HTML dan logic "narrativeBtn" telah dipadam di sini.


  // ================= 4. HELPER VISUAL =================
  function drawRoundedRect(ctx, x, y, w, h, r, fillColor, strokeColor) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fillStyle = fillColor; ctx.fill();
    if (strokeColor) { ctx.lineWidth = 4; ctx.strokeStyle = strokeColor; ctx.stroke(); }
  }


  // ================= 5. INFO PANEL (SAIZ DIKECILKAN) =================
  function createInfoLabel() {
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext("2d");
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    
    // [UBASUAI] Saiz PlaneGeometry dikecilkan dari (0.6, 0.3) kepada (0.4, 0.2)
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.2), material);
    mesh.scale.set(0, 0, 0); 
    mesh.userData = { targetScale: 0, currentScale: 0, timer: null };

    mesh.showText = (text) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Lukis kotak
        drawRoundedRect(ctx, 10, 10, 492, 236, 30, "rgba(0, 0, 0, 0.75)", "#FFCC00");

        // Font settings
        ctx.font = "bold 40px Arial"; ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        
        const words = text.split(" ");
        let line = ""; let y = canvas.height / 2;
        if(words.length > 3) y = canvas.height / 2 - 20;

        ctx.fillText(text, canvas.width / 2, y);
        texture.needsUpdate = true;

        mesh.userData.targetScale = 1;
        clearTimeout(mesh.userData.timer);
        mesh.userData.timer = setTimeout(() => { mesh.userData.targetScale = 0; }, 4000);
    };
    return mesh;
  }


  // ================= 6. QUIZ PANEL =================
  const quizGroup = new THREE.Group();
  quizGroup.visible = false; 
  quizGroup.scale.set(0,0,0);
  quizGroup.position.set(0.9, 0, 0); 
  anchor.group.add(quizGroup);

  const quizCanvas = document.createElement("canvas");
  quizCanvas.width = 512; quizCanvas.height = 512;
  const quizCtx = quizCanvas.getContext("2d");
  const quizTexture = new THREE.CanvasTexture(quizCanvas);

  const quizPanelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.8),
      new THREE.MeshBasicMaterial({ map: quizTexture, transparent: true })
  );
  quizGroup.add(quizPanelMesh);

  // A. Butang Jawapan (C. Ingkot Pangkat = Betul)
  const correctIndex = 2; 
  const btnMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }); 
  const btnGeo = new THREE.PlaneGeometry(0.65, 0.15); 
  const yPositions = [0.15, -0.02, -0.19, -0.36]; 

  for(let i=0; i<4; i++) {
      const btn = new THREE.Mesh(btnGeo, btnMat);
      btn.position.set(0, yPositions[i], 0.05); 
      btn.userData = { isAnswer: true, index: i, correct: (i === correctIndex) };
      quizGroup.add(btn);
  }

  // B. Butang Tutup (X)
  function createCloseBtnTexture() {
      const cvs = document.createElement('canvas');
      cvs.width = 64; cvs.height = 64;
      const c = cvs.getContext('2d');
      c.beginPath(); c.arc(32, 32, 30, 0, Math.PI * 2);
      c.fillStyle = "#FF5252"; c.fill(); c.strokeStyle = "white"; c.lineWidth = 4; c.stroke();
      c.beginPath(); c.moveTo(20, 20); c.lineTo(44, 44); c.moveTo(44, 20); c.lineTo(20, 44);
      c.strokeStyle = "white"; c.lineWidth = 6; c.lineCap = "round"; c.stroke();
      return new THREE.CanvasTexture(cvs);
  }
  const closeBtnMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.08, 0.08),
      new THREE.MeshBasicMaterial({ map: createCloseBtnTexture(), transparent: true })
  );
  closeBtnMesh.position.set(0.35, 0.35, 0.05); 
  closeBtnMesh.userData = { isCloseBtn: true };
  quizGroup.add(closeBtnMesh);

  // C. Lukis UI
  function drawQuizUI(feedback = null) {
      quizCtx.clearRect(0, 0, 512, 512);
      drawRoundedRect(quizCtx, 10, 10, 492, 492, 40, "#5D4037", "#8D6E63");
      drawRoundedRect(quizCtx, 30, 20, 452, 60, 20, "#3E2723", null);
      quizCtx.font = "bold 28px Arial"; quizCtx.fillStyle = "#FFCC00";
      quizCtx.textAlign = "center"; quizCtx.fillText("MANAKAH AKSESORI PINGGANG?", 256, 60);

      const options = ["A. Tanjak", "B. Mandapun", "C. Ingkot Pangkat", "D. Salempang"];
      let startY = 110; 
      options.forEach((opt, i) => {
          let btnColor = "#FFFFFF"; let textColor = "#333333";
          if (feedback) {
              if (i === feedback.index) {
                  btnColor = feedback.correct ? "#4CAF50" : "#F44336"; 
                  textColor = "#FFFFFF";
              } else if (i === correctIndex && !feedback.correct) {
                  btnColor = "#A5D6A7"; 
              }
          }
          drawRoundedRect(quizCtx, 40, startY, 432, 80, 15, btnColor, "#CCCCCC");
          quizCtx.font = "bold 32px Arial"; quizCtx.fillStyle = textColor;
          quizCtx.textAlign = "left"; quizCtx.fillText(opt, 60, startY + 50);
          startY += 95; 
      });

      if (feedback) {
         quizCtx.font = "bold 26px Arial"; quizCtx.fillStyle = feedback.correct ? "#4CAF50" : "#FF5252";
         quizCtx.textAlign = "center"; quizCtx.fillText(feedback.correct ? "BETUL! C. INGKOT PANGKAT 🎉" : "SALAH. CUBA LAGI!", 256, 495);
      }
      quizTexture.needsUpdate = true;
  }
  drawQuizUI();


  // ================= 7. MODEL LOAD =================
  const dLoader = new DRACOLoader();
  dLoader.setDecoderPath("/WebsiteFYP/libs/draco/");
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dLoader);

  const gltf = await gltfLoader.loadAsync("/WebsiteFYP/assets/models/bajulelaki.glb");
  const model = gltf.scene;
  model.scale.set(0.8, 0.8, 0.8);
  model.position.set(0, -0.4, 0);
   
  const infoLabel = createInfoLabel();
  model.add(infoLabel); 

  anchor.group.add(model);


  // ================= 8. INTERACTION =================
  let isDragging = false;
  let previousX = 0;
  window.addEventListener("pointerdown", (e) => { isDragging = true; previousX = e.clientX; });
  window.addEventListener("pointerup", () => { isDragging = false; });
  window.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousX;
    model.rotation.y += deltaX * 0.01;
    previousX = e.clientX;
  });
  window.addEventListener("wheel", (e) => {
      e.preventDefault();
      let scale = model.scale.x - e.deltaY * 0.001;
      scale = Math.min(Math.max(scale, 0.3), 2);
      model.scale.setScalar(scale);
  }, { passive: false });


  // ================= 9. RAYCASTER & LOGIC =================
  const infoMap = {
    Mandapun: "Mandapun",
    Tanjak: "Tanjak",
    Ingkot_Pangkat: "Ingkot Pangkat",
    Salempang: "Salempang",
    Samping: "Supu", 
  };
  const requiredParts = Object.keys(infoMap);
  const clickedParts = new Set();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let quizTriggered = false; 

  window.addEventListener("pointerup", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    
    // Check Quiz
    const quizHits = raycaster.intersectObjects(quizGroup.children, true);
    if (quizGroup.visible && quizHits.length > 0) {
        const hitObj = quizHits[0].object;
        if (hitObj.userData.isAnswer) {
            drawQuizUI({ index: hitObj.userData.index, correct: hitObj.userData.correct });
        } else if (hitObj.userData.isCloseBtn) {
            quizGroup.visible = false; 
        }
        return; 
    }

    // Check Model
    const hits = raycaster.intersectObject(model, true); 
    if (hits.length > 0) {
        let target = hits[0].object;
        while (target.parent && !infoMap[target.name]) { target = target.parent; }

        if (infoMap[target.name]) {
            const clickPoint = hits[0].point.clone();
            model.worldToLocal(clickPoint);
            infoLabel.position.copy(clickPoint);
            infoLabel.position.add(new THREE.Vector3(0.4, 0.1, 0)); 
            infoLabel.showText(infoMap[target.name]);
            
            stopAllInfoAudio();
            if (audioMap[target.name]) audioMap[target.name].play();

            clickedParts.add(target.name);
            if (requiredParts.every(p => clickedParts.has(p)) && !quizTriggered) {
                quizTriggered = true; 
                setTimeout(() => { quizGroup.visible = true; }, 4500); 
            }
        }
    }
  });


  // ================= 10. ANIMATION LOOP =================
  anchor.onTargetFound = () => { if (!bgMusic.isPlaying) bgMusic.play(); };
  anchor.onTargetLost = () => { if (bgMusic.isPlaying) bgMusic.pause(); stopAllInfoAudio(); };

  await mindarThree.start();
   
  renderer.setAnimationLoop(() => {
    const currentS = infoLabel.userData.currentScale;
    const targetS = infoLabel.userData.targetScale;
    infoLabel.userData.currentScale += (targetS - currentS) * 0.2; 
    const s = infoLabel.userData.currentScale;
    infoLabel.scale.set(s, s, s);
    infoLabel.lookAt(camera.position); 

    if (quizGroup.visible) {
        quizGroup.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        quizGroup.lookAt(camera.position); 
    }
    renderer.render(scene, camera);
  });
});