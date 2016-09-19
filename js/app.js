if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
}

var container;

var camera, controls, scene, renderer;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var OBJLoaded;

init();
animate();

function init() {

    container = document.getElementById('cubeAni');
    document.body.appendChild(container);

    /* Camera */

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 0;
    camera.position.y = 5;
    camera.position.z = 8;

    /* Scene */

    scene = new THREE.Scene();
    // lighting = false;

    var ambient = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambient);

    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(50, 100, 50);
    spotLight.angle = Math.PI / 7;
    spotLight.penumbra = 0.8
    spotLight.castShadow = true;
    scene.add(spotLight);

    //floor


    var floorMaterial = new THREE.MeshStandardMaterial( {
                    map: null,
                    roughnessMap: null,
                    color: 0xffffff,
                    metalness: 0.0,
                    roughness: 0.0,
                    shading: THREE.SmoothShading
                } );
    var planeGeometry = new THREE.PlaneBufferGeometry( 8, 8 );

    var planeMesh1 = new THREE.Mesh( planeGeometry, floorMaterial );
                planeMesh1.position.y = - 2;
                planeMesh1.rotation.x = - Math.PI * 0.5;
                planeMesh1.receiveShadow = true;
                scene.add( planeMesh1 );

    /* Model */

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setBaseUrl('assets/');
    mtlLoader.setPath('assets/');
    mtlLoader.load('ZansCube.mtl', function (materials) {


        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('assets/');
        objLoader.load('ZansCube.obj', function (object) {

            OBJLoaded = object;
            scene.add(object);

        });

    });

    /* Renderer */

    renderer = new THREE.WebGLRenderer( { alpha: true } );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor( 0x000000, 0 );
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    /* Controls */

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    /* Events */

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('keydown', onKeyboardEvent, false);
}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function onKeyboardEvent(e) {

    if (e.code === 'KeyL') {

        lighting = !lighting;

        if (lighting) {

            ambient.intensity = 0.25;
            scene.add(keyLight);
            scene.add(fillLight);
            scene.add(backLight);

        } else {

            ambient.intensity = 1.0;
            scene.remove(keyLight);
            scene.remove(fillLight);
            scene.remove(backLight);

        }

    }

}

function animate() {

    requestAnimationFrame(animate);

    controls.update();

    render();

}

function render() {

    var rotSpeed = 0.004;
    if (OBJLoaded)
    {
        OBJLoaded.rotation.y -= rotSpeed;
    }

    renderer.render(scene, camera);

}