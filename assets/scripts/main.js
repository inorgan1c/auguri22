import { mockWithVideo } from "../libs/camera-mock.js";
import { loadAudio, loadGLTF, loadTexture } from "../libs/loader.js";

const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener("DOMContentLoaded", () => {
  //mockWithVideo("assets/video/camera-mock.mp4");

  const start = async () => {
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.getElementById("ar_container"),
      imageTargetSrc: "assets/targets/targets.mind",
    });

    const { renderer, scene, camera } = mindarThree;
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    const anchor = mindarThree.addAnchor(0);
    const gltf = await loadGLTF("assets/models/auguri.glb");
    const audioClip = await loadAudio("assets/audio/christmas.mp3")
    const audioListener = new THREE.AudioListener();
    const audioSrc = new THREE.Audio(audioListener);
    const mixer = new THREE.AnimationMixer(gltf.scene);
    const action = mixer.clipAction(gltf.animations[0]);
    const clock = new THREE.Clock();
    
    //setup audio FX to play on target found
    audioSrc.setBuffer(audioClip);
    camera.add(audioListener);

    //setup anchor and gltf scene
    gltf.scene.scale.set(0.3,0.3,0.3);
    gltf.scene.rotation.set(Math.PI/2,0,0);
    gltf.scene.position.set(0,0,0);
    anchor.group.add(gltf.scene);
    anchor.group.add(audioSrc);
    action.play();
    scene.add(light);

    //on target found
    anchor.onTargetFound = () => {
      audioSrc.play();    
    };

    //on target lost, pause audio
    anchor.onTargetLost = () => {
      audioSrc.pause();
      audioSrc.stop();
    }

    //start ar engine
    await mindarThree.start();

    //animation update loop
    renderer.setAnimationLoop(() => {
      //render scene
      renderer.render(scene, camera);
      mixer.update(clock.getDelta());
    });
  };

  start();
});
