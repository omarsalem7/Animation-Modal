function myRender() {
  // Set main variables
  let scene,
    renderer,
    camera,
    model, // Our character
    neck, //  neck bone in the skeleton
    waist, // waist bone in the skeleton
    OurAnimations, // Animations
    mixer, //  animations mixer
    idle, // the default state our character which returns to
    clock = new THREE.Clock(), // Used for anims, which run to a clock instead of frame rate
    currentlyAnimating = false, // Used to check whether characters neck is being used in another anim
    raycaster = new THREE.Raycaster(); // Used to detect the click on our character

  function init() {
    //model with animation done by blender and mixamo
    const MODEL_PATH =
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy_lightweight.glb";
    const canvas = document.querySelector("#c");
    const backgroundColor = 0xeab675;

    // Init the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);

    // Init the renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Add a camera
    camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    camera.position.z = 30;
    camera.position.x = 0;
    camera.position.y = -3;

    var loader = new THREE.GLTFLoader();

    loader.load(
      MODEL_PATH,
      function (gltf) {
        model = gltf.scene;
        let fileAnimations = gltf.animations;

        model.traverse((o) => {
          // Reference the neck and waist bones
          if (o.isBone && o.name === "mixamorigNeck") {
            neck = o;
          }
          if (o.isBone && o.name === "mixamorigSpine") {
            waist = o;
          }
        });

        model.scale.set(7, 7, 7);
        model.position.y = -11;
        scene.add(model);

        mixer = new THREE.AnimationMixer(model);

        let clips = fileAnimations.filter((val) => val.name !== "idle");
        OurAnimations = clips.map((val) => {
          let clip = THREE.AnimationClip.findByName(clips, val.name);

          clip.tracks.splice(3, 3);
          clip.tracks.splice(9, 3);

          clip = mixer.clipAction(clip);
          return clip;
        });

        let idleAnim = THREE.AnimationClip.findByName(fileAnimations, "idle");

        idleAnim.tracks.splice(3, 3);
        idleAnim.tracks.splice(9, 3);

        idle = mixer.clipAction(idleAnim);
        idle.play();
      },
      undefined
    );
  }
  init();
  update();

  function update() {
    if (mixer) {
      mixer.update(clock.getDelta());
    }

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(update);
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;

    const needResize =
      canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  window.addEventListener("click", (e) => raycast(e));
  function raycast(e) {
    var mouse = {};

    mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
    mouse.y = 1 - 2 * (e.clientY / window.innerHeight);

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects[0]) {
      var object = intersects[0].object;

      if (object.name === "stacy") {
        if (!currentlyAnimating) {
          currentlyAnimating = true;
          playOnClick();
        }
      }
    }
  }

  // Get a random animation, and play it
  function playOnClick() {
    let anim = Math.floor(Math.random() * OurAnimations.length) + 0;
    playModifierAnimation(idle, 0.25, OurAnimations[anim], 0.25);
  }

  function playModifierAnimation(from, fSpeed, to, tSpeed) {
    to.setLoop(THREE.LoopOnce);
    to.reset();
    to.play();
    from.crossFadeTo(to, fSpeed, true);
    setTimeout(function () {
      from.enabled = true;
      to.crossFadeTo(from, tSpeed, true);
      currentlyAnimating = false;
    }, to._clip.duration * 1000 - (tSpeed + fSpeed) * 1000);
  }

  document.addEventListener("mousemove", function (e) {
    var mouseCoordinates = mousePosition(e);
    if (neck && waist) {
      joinMove(mouseCoordinates, neck, 50);
      joinMove(mouseCoordinates, waist, 30);
    }
  });

  function mousePosition(e) {
    return { x: e.clientX, y: e.clientY };
  }

  function joinMove(mouse, joint, degreeLimit) {
    let degrees = mouseDegrees(mouse.x, mouse.y, degreeLimit);
    joint.rotation.y = THREE.Math.degToRad(degrees.x);
    joint.rotation.x = THREE.Math.degToRad(degrees.y);
    console.log(joint.rotation.x);
  }

  function mouseDegrees(x, y, degreeLimit) {
    let dx = 0,
      dy = 0,
      xdiff,
      xPercentage,
      ydiff,
      yPercentage;

    let w = { x: window.innerWidth, y: window.innerHeight };

    // If cursor is in the left half of screen
    if (x <= w.x / 2) {
      //  the difference between middle of screen and cursor position
      xdiff = w.x / 2 - x;
      //  Find the percentage of that difference (percentage toward edge of screen)
      xPercentage = (xdiff / (w.x / 2)) * 100;
      //  Convert that to a percentage of the maximum rotation we allow for the neck
      dx = ((degreeLimit * xPercentage) / 100) * -1;
    }

    // Rotates neck right between 0 and degreeLimit
    if (x >= w.x / 2) {
      xdiff = x - w.x / 2;
      xPercentage = (xdiff / (w.x / 2)) * 100;
      dx = (degreeLimit * xPercentage) / 100;
    }
    // Rotates neck up between 0 and -degreeLimit
    if (y <= w.y / 2) {
      ydiff = w.y / 2 - y;
      yPercentage = (ydiff / (w.y / 2)) * 100;
      // cut degreeLimit in half when she looks up
      dy = ((degreeLimit * 0.5 * yPercentage) / 100) * -1;
    }
    // Rotates neck down between 0 and degreeLimit
    if (y >= w.y / 2) {
      ydiff = y - w.y / 2;
      yPercentage = (ydiff / (w.y / 2)) * 100;
      dy = (degreeLimit * yPercentage) / 100;
    }
    return { x: dx, y: dy };
  }
}
setTimeout(() => {
  myRender();
}, 3500);
