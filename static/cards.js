document.addEventListener('DOMContentLoaded', function () {
  // Prepare the data
  const data = JSON.parse(document.getElementById('table-data').textContent);
  let texts = [], colors = [];
  data.forEach((row, i) => {
    const text = row[0] + " " + row[1];
    if(text.trim()) {
      texts.push(text);
      colors.push(`hsl(${(i*137.5)%360},70%,60%)`);
    }
  });
  if(!texts.length) texts = ["123 Main St John Doe", "456 Elm St Jane Smith"];
  if(!colors.length) colors = texts.map(() => `hsl(${Math.round(Math.random()*360)},70%,60%)`);

  const canvas = document.getElementById('threejs-table');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#111");
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 30, 70);
  camera.lookAt(0, 0, 0);
  const controls = new THREE.OrbitControls(camera, renderer.domElement);

  const simplex = new SimplexNoise();

  // Simulate "3D" depth for card lettering
  function makeCardTexture(text, color) {
    const width=320, height=90;
    const c=document.createElement("canvas");
    c.width=width; c.height=height;
    const ctx=c.getContext("2d");
    ctx.clearRect(0,0,width,height);

    // Border only
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(7,7,width-14,height-14);

    ctx.font = "bold 22px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Fake extrusion via text shadows
    function drawDepth(txt, y) {
      for(let d=7; d>=2; --d) {
        ctx.globalAlpha = 0.06 + d*0.04;
        ctx.fillStyle = "#111";
        ctx.fillText(txt, width/2+d, y+d);
      }
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = color;
      ctx.fillText(txt, width/2, y);
    }

    let split = text.length>25 ?
      [text.slice(0,Math.floor(text.length/2)), text.slice(Math.floor(text.length/2)).trim()] :
      [text];
    if(split.length === 1){
      drawDepth(split[0], height/2);
    } else {
      drawDepth(split[0], height/2-18);
      drawDepth(split[1], height/2+18);
    }
    return new THREE.CanvasTexture(c);
  }

  // Create cards with staggered fall
  const grid = Math.ceil(Math.sqrt(texts.length * 1.2));
  const spacing = 8, fallStartY = 150;
  let cards = [], meshes = [];
  for(let i=0;i<grid*grid;++i){
    if(i>=texts.length) break;
    const x = (i%grid-grid/2)*spacing, z = (Math.floor(i/grid)-grid/2)*spacing;
    const tex = makeCardTexture(texts[i], colors[i]);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(6.0, 2.2),
      new THREE.MeshBasicMaterial({map: tex, transparent: true, color:0xffffff})
    );
    mesh.position.set(x, fallStartY+Math.random()*40, z);
    scene.add(mesh);
    cards.push({
      mesh,
      x, z,
      vx: 0, vz: 0, lastDragX: 0, lastDragZ: 0, lastDragT: 0,
      groundY: simplex.noise2D(x/22, z/22)*6.5,
      state:"wait",
      time0: Math.random()*14.5 + .5, // up to 15s
      fallVY: 0,
      bounceT: 0,
      delayB: Math.random(),
      mass: 0.85 + Math.random()*0.25
    });
    meshes.push(mesh);
  }

  // Drag Controls: disables Orbits during, and dropped cards never return; horizontal momentum
  const dragControls = new THREE.DragControls(meshes, camera, renderer.domElement);
  dragControls.addEventListener('dragstart', function (event) {
    controls.enabled = false;
    event.object.material.opacity = 0.67;
    event.object.material.color.set(0xeeffee);
    let card = cards.find(c=>c.mesh===event.object);
    if(card){
      card.lastDragX = event.object.position.x;
      card.lastDragZ = event.object.position.z;
      card.lastDragT = performance.now();
      card.vx = 0; card.vz = 0;
    }
  });
  dragControls.addEventListener('drag', function (event) {
    let card = cards.find(c=>c.mesh===event.object);
    if(card){
      const now = performance.now();
      const dt = (now-card.lastDragT)*0.001 || 1/60;
      card.vx = (event.object.position.x - card.lastDragX) / dt;
      card.vz = (event.object.position.z - card.lastDragZ) / dt;
      card.lastDragX = event.object.position.x;
      card.lastDragZ = event.object.position.z;
      card.lastDragT = now;
    }
  });
  dragControls.addEventListener('dragend', function (event) {
    controls.enabled = true;
    event.object.material.opacity = 1;
    event.object.material.color.set(0xffffff);
    const {object} = event;
    let card = cards.find(c=>c.mesh===object);
    if(card){
      card.x = object.position.x;
      card.z = object.position.z;
      card.groundY = simplex.noise2D(card.x/22, card.z/22)*6.5;
      if(object.position.y < card.groundY + 0.7){
        object.position.y = card.groundY+8+Math.random()*10;
        card.state = "fall"; card.fallVY = 0;
      } else {
        card.state = "fall"; card.fallVY = 0;
      }
      // vx, vz already set from drag
    }
  });

  function animate(t){
    t*=0.001;
    for(const card of cards){
      if(card.state==="wait"){
        if(t>=card.time0) card.state="fall";
        else{ card.mesh.visible=false; continue; }
      }
      card.mesh.visible=true;
      if(card.state==="fall"){
        card.fallVY -= 0.23;
        card.mesh.position.y += card.fallVY * 0.04;
        // Animate x/z too
        card.mesh.position.x += card.vx * 0.04;
        card.mesh.position.z += card.vz * 0.04;
        card.vx *= 0.965;
        card.vz *= 0.965;
        card.x = card.mesh.position.x;
        card.z = card.mesh.position.z;
        card.groundY = simplex.noise2D(card.x/22, card.z/22)*6.5;
        if(card.mesh.position.y <= card.groundY){
          card.mesh.position.y = card.groundY;
          if(Math.abs(card.fallVY) > 2.0){
            card.fallVY = -card.fallVY * (0.25 + card.mass*0.12);
            card.vx *= 0.7;
            card.vz *= 0.7;
          } else {
            card.fallVY = 0; card.vx = 0; card.vz = 0;
            card.state = "landed"; card.bounceT = t;
          }
        }
      } else if(card.state==="landed"){
        const b = 0.04 * Math.exp(-1.2*(t-card.bounceT));
        card.mesh.rotation.y = Math.sin(t*2.0+card.delayB)*b;
        card.mesh.rotation.x = Math.cos(t*2.0+card.delayB*2)*b;
      }
      if(card.state!=="landed"){
        card.mesh.rotation.y = Math.sin((card.x+card.z+t)*0.08)*0.08;
        card.mesh.rotation.x = Math.sin((card.z+card.x+t)*0.04)*0.07;
      }
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate(0);

  window.addEventListener('resize', ()=>{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  });
});