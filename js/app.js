if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
}

var container, stats;

var camera, controls, scene, renderer, objects = [];

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var OBJLoaded;

var hdrCubeMap;
var ldrCubeRenderTarget, hdrCubeRenderTarget, rgbmCubeRenderTarget;

var standardMaterial, floorMaterial;

var params = {
                envMap: "HDR",
                projection: 'normal',
                roughness: 1.0,
                bumpScale: 0.3,
                background: false,
                exposure: 1.0,
            };

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

    var ambient = new THREE.AmbientLight(0x222222);
    scene.add(ambient);

    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-1, 4, 5);
    spotLight.angle = Math.PI / 2;
    spotLight.penumbra = 0.8
    spotLight.castShadow = true;
    spotLight.shadow.bias = 0.0015;
    scene.add(spotLight);

    //standard material
    standardMaterial = new THREE.MeshStandardMaterial( {
                    map: null,
                    bumpScale: - 0.05,
                    color: 0xffffff,
                    metalness: 1.0,
                    roughness: 1.0,
                    shading: THREE.SmoothShading
                } );

    ////hdr
    var genCubeUrls = function( prefix, postfix ) {
                    return [
                        prefix + 'px' + postfix, prefix + 'nx' + postfix,
                        prefix + 'py' + postfix, prefix + 'ny' + postfix,
                        prefix + 'pz' + postfix, prefix + 'nz' + postfix
                    ];
                };

    //HDR

    var hdrUrls = genCubeUrls( './textures/cube/pisaHDR/', '.hdr' );
                new THREE.HDRCubeTextureLoader().load( THREE.UnsignedByteType, hdrUrls, function ( hdrCubeMap ) {

                    var pmremGenerator = new THREE.PMREMGenerator( hdrCubeMap );
                    pmremGenerator.update( renderer );

                    var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker( pmremGenerator.cubeLods );
                    pmremCubeUVPacker.update( renderer );

                    hdrCubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;

                } );


    //LDR
    var ldrUrls = genCubeUrls( "./textures/cube/pisa/", ".png" );
                new THREE.CubeTextureLoader().load( ldrUrls, function ( ldrCubeMap ) {

                    ldrCubeMap.encoding = THREE.GammaEncoding;

                    var pmremGenerator = new THREE.PMREMGenerator( ldrCubeMap );
                    pmremGenerator.update( renderer );

                    var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker( pmremGenerator.cubeLods );
                    pmremCubeUVPacker.update( renderer );

                    ldrCubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;

                } );

    ///RGBM
    var rgbmUrls = genCubeUrls( "./textures/cube/pisaRGBM16/", ".png" );
                new THREE.CubeTextureLoader().load( rgbmUrls, function ( rgbmCubeMap ) {

                    rgbmCubeMap.encoding = THREE.RGBM16Encoding;

                    var pmremGenerator = new THREE.PMREMGenerator( rgbmCubeMap );
                    pmremGenerator.update( renderer );

                    var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker( pmremGenerator.cubeLods );
                    pmremCubeUVPacker.update( renderer );

                    rgbmCubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;

                } );

    //floor


    floorMaterial = new THREE.MeshStandardMaterial( {
                    map: null,
                    roughnessMap: null,
                    color: 0xffffff,
                    metalness: 0.0,
                    roughness: 0.0,
                    shading: THREE.SmoothShading
                } );

    var planeGeometry = new THREE.PlaneBufferGeometry( 8, 8 );

    var planeMesh1 = new THREE.Mesh( planeGeometry, floorMaterial );
                planeMesh1.position.y = - 1;
                planeMesh1.rotation.x = - Math.PI * 0.5;
                planeMesh1.receiveShadow = true;
                planeMesh1.castShadow = true;
                scene.add( planeMesh1 );

    var textureLoader = new THREE.TextureLoader();
                textureLoader.load( './textures/roughness_map.jpg', function( map ) {
                    map.wrapS = THREE.RepeatWrapping;
                    map.wrapT = THREE.RepeatWrapping;
                    map.anisotropy = 4;
                    map.repeat.set( 9, 2 );
                    standardMaterial.roughnessMap = map;
                    standardMaterial.bumpMap = map;
                    standardMaterial.needsUpdate = true;
                } );

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
            OBJLoaded.position.set(-2,0,0);
            scene.add(OBJLoaded);

        });

    });


    ///knot thing
    var geometry = new THREE.TorusKnotGeometry( 18, 8, 150, 20 );;
                var torusMesh1 = new THREE.Mesh( geometry, standardMaterial );
                torusMesh1.position.x = 0.0;
                torusMesh1.castShadow = true;
                torusMesh1.receiveShadow = true;
                torusMesh1.scale.set(0.05, 0.05, 0.05);
                torusMesh1.position.set(2,1,0);
                scene.add( torusMesh1 );
                objects.push( torusMesh1 );

    /* Renderer */

    renderer = new THREE.WebGLRenderer( { alpha: true } );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    //renderer.toneMapping = THREE.ReinhardToneMapping;

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    stats = new Stats();
    container.appendChild( stats.dom );

    /* Controls */

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    /* Events */

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('keydown', onKeyboardEvent, false);

    ///gui
    var gui = new dat.GUI();

    gui.add( params, 'envMap', [ 'None', 'LDR', 'HDR', 'RGBM16' ] );
                gui.add( params, 'roughness', 0, 1 );
                gui.add( params, 'bumpScale', - 1, 1 );
                gui.add( params, 'exposure', 0.1, 2 );
                gui.open();
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

    }

}

function animate() {

    requestAnimationFrame(animate);

    controls.update();

    stats.begin();
    render();
    stats.end();

}

function render() {

    var rotSpeed = 0.004;
    if (OBJLoaded)
    {
        OBJLoaded.rotation.y -= rotSpeed;
        OBJLoaded.castShadow = true;
    }


        if ( standardMaterial !== undefined ) {

            standardMaterial.roughness = params.roughness;
            standardMaterial.bumpScale = - 0.05 * params.bumpScale;

            var newEnvMap = standardMaterial.envMap;
            switch( params.envMap ) {

                case 'None': newEnvMap = null; break;
                case 'LDR': newEnvMap = ldrCubeRenderTarget ? ldrCubeRenderTarget.texture : null; break;
                case 'HDR': newEnvMap = hdrCubeRenderTarget ? hdrCubeRenderTarget.texture : null; break;
                case 'RGBM16': newEnvMap = rgbmCubeRenderTarget ? rgbmCubeRenderTarget.texture : null; break;

            }

            if( newEnvMap !== standardMaterial.envMap ) {

                standardMaterial.envMap = newEnvMap;
                standardMaterial.needsUpdate = true;
                floorMaterial.emissive = new THREE.Color( 1, 1, 1 );
                floorMaterial.emissiveMap = newEnvMap;
                floorMaterial.needsUpdate = true;

            }
        }


    var timer = Date.now() * 0.00025;

    camera.lookAt( scene.position );

    for ( var i = 0, l = objects.length; i < l; i ++ ) {

        var object = objects[ i ];
        object.rotation.y += 0.005;

    }

    renderer.render(scene, camera);

}