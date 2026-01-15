import { DRACOLoader } from "/WebsiteFYP/libs/three.js-r132/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "/WebsiteFYP/libs/three.js-r132/examples/jsm/loaders/GLTFLoader.js";

const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener("DOMContentLoaded", () => {

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
  backBtn.addEventListener("click", () => { window.location.href = "/WebsiteFYP/muzik.html"; });


  // ================= 2. MAIN AR LOGIC =================
  const start = async () => {
    try {
      const mindarThree = new window.MINDAR.IMAGE.MindARThree({
        container: document.querySelector("#ar-container"),
        imageTargetSrc: "/WebsiteFYP/assets/targets/gendangs.mind",
      });

      const { renderer, scene, camera } = mindarThree;
      scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1));
      const anchor = mindarThree.addAnchor(0);

      // ================= 3. AUDIO SETUP =================
      const listener = new THREE.AudioListener();
      camera.add(listener);
      const audioLoader = new THREE.AudioLoader();

      // A. Audio Bunyi Gendang (Ketukan Sekali)
      const gendangHitSound = new THREE.Audio(listener);
      audioLoader.load("/WebsiteFYP/assets/sound/Gendang.mp3", (buffer) => {
        gendangHitSound.setBuffer(buffer);
        gendangHitSound.setLoop(false); 
        gendangHitSound.setVolume(1.0);
      });

      // B. Audio Lagu Gendang (Looping)
      const gendangMusic = new THREE.Audio(listener);
      audioLoader.load("/WebsiteFYP/assets/sound/LaguGendang.mp3", (buffer) => { 
        gendangMusic.setBuffer(buffer);
        gendangMusic.setLoop(true); 
        gendangMusic.setVolume(0.5);
      });


      // ================= 4. CREATE 3D OBJECTS =================
      
      // --- A. Model Gendang ---
      const dLoader = new DRACOLoader();
      dLoader.setDecoderPath("/WebsiteFYP/libs/draco/");
      const gltfLoader = new GLTFLoader();
      gltfLoader.setDRACOLoader(dLoader);

      const gltf = await new Promise((resolve, reject) => {
        gltfLoader.load("/WebsiteFYP/assets/models/gendang.glb", resolve, undefined, reject);
      });

      const model = gltf.scene;
      model.scale.set(0.5, 0.5, 0.5);
      model.userData = { type: "gendangModel" }; 
      anchor.group.add(model);


      // --- B. Butang Speaker 3D (Coklat, Sederhana) ---
      function createMusicButton() {
          const geometry = new THREE.CircleGeometry(0.10, 32); 
          const canvas = document.createElement('canvas');
          canvas.width = 128; canvas.height = 128;
          const ctx = canvas.getContext('2d');

          // Warna Coklat
          ctx.beginPath(); ctx.arc(64, 64, 64, 0, Math.PI * 2);
          ctx.fillStyle = "#4B3832"; ctx.fill();

          // Ikon Speaker
          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.moveTo(35, 50); ctx.lineTo(35, 78); ctx.lineTo(55, 78);
          ctx.lineTo(80, 100); ctx.lineTo(80, 28); ctx.lineTo(55, 50);
          ctx.closePath(); ctx.fill();

          // Gelombang Bunyi
          ctx.strokeStyle = "white"; ctx.lineWidth = 6; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.arc(85, 64, 20, -Math.PI/3, Math.PI/3); ctx.stroke();
          ctx.beginPath(); ctx.arc(95, 64, 30, -Math.PI/3, Math.PI/3); ctx.stroke();

          const texture = new THREE.CanvasTexture(canvas);
          const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
          const buttonMesh = new THREE.Mesh(geometry, material);

          // Posisi: Sebelah Kanan, Jarak Sikit
          buttonMesh.position.set(0.75, 0.1, 0); 
          buttonMesh.userData = { type: "musicBtn", clock: new THREE.Clock() };
          
          return buttonMesh;
      }
      const musicBtn = createMusicButton();
      anchor.group.add(musicBtn);


      // ================= 5. INTERACTION (ROTATE & ZOOM) =================
      let isDragging = false;
      let previousX = 0;
      let previousY = 0;
      const minX = -Math.PI / 6; 
      const maxX = Math.PI / 6;  

      window.addEventListener("pointerdown", (e) => {
        if (e.target.closest('button')) return;
        isDragging = true; previousX = e.clientX; previousY = e.clientY;
      });
      window.addEventListener("pointerup", () => { isDragging = false; });
      window.addEventListener("pointerleave", () => { isDragging = false; });
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
          let scale = model.scale.x; 
          scale -= e.deltaY * 0.001;
          scale = Math.min(Math.max(scale, 0.3), 2);
          model.scale.setScalar(scale);
      }, { passive: false });


      // ================= 6. CLICK LOGIC (RAYCASTER) - ANTI-MIX =================
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      window.addEventListener("pointerup", (e) => {
        if (isDragging && (Math.abs(e.clientX - previousX) > 5)) return; 
        if (e.target.closest('button')) return;

        if (listener.context.state === 'suspended') listener.context.resume();

        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        
        const objectsToCheck = [model, musicBtn];
        const hits = raycaster.intersectObjects(objectsToCheck, true);

        if (hits.length > 0) {
            let object = hits[0].object;
            while(object.parent && !object.userData.type) { object = object.parent; }

            const type = object.userData.type;

            // --- A. KLIK BUTANG SPEAKER (LAGU) ---
            if (type === "musicBtn") {
                if (gendangMusic.isPlaying) {
                    gendangMusic.pause();
                    musicBtn.material.color.setHex(0xaaaaaa); 
                } else {
                    // [PENTING] STOP BUNYI KETUKAN SUPAYA TAK MIX
                    if (gendangHitSound.isPlaying) gendangHitSound.stop();

                    gendangMusic.play();
                    musicBtn.material.color.setHex(0xffffff); 
                }
            }

            // --- B. KLIK MODEL GENDANG (KETUK) ---
            else if (type === "gendangModel") {
                // [PENTING] STOP LAGU DULU SUPAYA TAK MIX
                if (gendangMusic.isPlaying) {
                    gendangMusic.pause();
                    musicBtn.material.color.setHex(0xaaaaaa); // Reset warna button speaker
                }

                // Mainkan bunyi ketuk
                if (gendangHitSound.isPlaying) gendangHitSound.stop(); 
                gendangHitSound.play();
                
                // Animasi Gegar
                model.scale.setScalar(model.scale.x * 1.05);
                setTimeout(() => {
                    model.scale.setScalar(model.scale.x / 1.05);
                }, 100);
            }
        }
      });


      // ================= 7. TARGET EVENTS =================
      anchor.onTargetLost = () => {
        if (gendangMusic.isPlaying) gendangMusic.pause();
        if (gendangHitSound.isPlaying) gendangHitSound.stop();
      };
      
      anchor.onTargetFound = () => {};

      // ================= START =================
      await mindarThree.start();
      
      renderer.setAnimationLoop(() => {
        if(musicBtn) {
            const time = musicBtn.userData.clock.getElapsedTime();
            const scale = 1 + Math.sin(time * 3) * 0.05; 
            musicBtn.scale.set(scale, scale, scale);
            musicBtn.lookAt(camera.position); 
        }
        renderer.render(scene, camera);
      });

    } catch (err) {
      console.error("AR ERROR:", err);
    }
  };

  start();
});