


// import React, { useRef, useEffect } from 'react';
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import { useNavigate } from 'react-router-dom'; // Import useNavigate
// import './GlobeDashboard.css';

// function GlobeDashboard() {
//   const globeRef = useRef(null);
//   const navigate = useNavigate(); // Use useNavigate hook for navigation

//   useEffect(() => {
//     // Scene setup
//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
//     // Set background color to white
//     const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Ensure alpha is true for transparency
//     // renderer.setClearColor(0xffffff, 1); // Set clear color to white with full opacity
//     renderer.setClearColor(0x111111, 1); // Set clear color to #111 with full opacity
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     globeRef.current.appendChild(renderer.domElement); // Attach the renderer to the DOM

//     // Add OrbitControls
//     const controls = new OrbitControls(camera, renderer.domElement);

//     // Load Earth texture map
//     const textureLoader = new THREE.TextureLoader();
//     const earthTexture = textureLoader.load("https://ksenia-k.com/img/earth-map-colored.png");

//     // Earth sphere
//     const sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
//     const sphereMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
//     const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
//     scene.add(sphere);

//     camera.position.z = 15;

//     // Animation loop
//     const animate = function () {
//       requestAnimationFrame(animate);
//       sphere.rotation.y += 0.005; // Rotate the sphere for a spinning effect
//       controls.update();
//       renderer.render(scene, camera);
//     };

//     animate();

//     // Handle resizing
//     function onWindowResize() {
//       camera.aspect = window.innerWidth / window.innerHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(window.innerWidth, window.innerHeight);
//     }
//     window.addEventListener('resize', onWindowResize, false);



// return () => {
//     if (globeRef.current && renderer.domElement) {
//       globeRef.current.removeChild(renderer.domElement); // Ensure this element exists
//     }
//     window.removeEventListener('resize', onWindowResize);
//     // Perform any additional cleanup if necessary, such as disposing of geometries, materials, etc.
//     sphereGeometry.dispose();
//     sphereMaterial.dispose();
//     controls.dispose(); // Dispose of controls if they are no longer needed
//   };
// }, []);

//   return (


//     <div className="globeDashboard">
//     <div ref={globeRef} className="globeContainer" />
//     <div className="sea360Text">Welcome  <br></br> to <br></br>SEACO 360</div>
//     <button onClick={() => navigate('/page3')} className="navigateButton">START</button> {/* Button to navigate to Page 3 */}
//   </div>

//   );
// }

// export default GlobeDashboard;















import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useNavigate } from 'react-router-dom';
import './GlobeDashboard.css';
import gsap from 'gsap';



// Define the fragment shader
const fragmentShader = `
uniform sampler2D u_map_tex;
varying float vOpacity;
varying vec2 vUv;

void main() {
    vec3 color = texture2D(u_map_tex, vUv).rgb;
    color -= .2 * length(gl_PointCoord.xy - vec2(.5));
    float dot = 1. - smoothstep(.38, .4, length(gl_PointCoord.xy - vec2(.5)));
    if (dot < 0.5) discard;
    gl_FragColor = vec4(color, dot * vOpacity);
}
`;

// Define the vertex shader
const vertexShader = `
uniform sampler2D u_map_tex;
uniform float u_dot_size;
uniform float u_time_since_click;
uniform vec3 u_pointer;
#define PI 3.14159265359
varying float vOpacity;
varying vec2 vUv;

void main() {
    vUv = uv;
    float visibility = step(.2, texture2D(u_map_tex, uv).r);
    gl_PointSize = visibility * u_dot_size;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vOpacity = (1. / length(mvPosition.xyz) - .7);
    vOpacity = clamp(vOpacity, .03, 1.);
    float t = u_time_since_click - .1;
    t = max(0., t);
    float max_amp = .15;
    float dist = 1. - .5 * length(position - u_pointer);
    float damping = 1. / (1. + 20. * t);
    float delta = max_amp * damping * sin(5. * t * (1. + 2. * dist) - PI);
    delta *= 1. - smoothstep(.8, 1., dist);
    vec3 pos = position;
    pos *= (1. + delta);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
}
`;

function GlobeDashboard() {
  const globeRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x111111, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    globeRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    // Use a texture that highlights land masses for a data map look. 
    // This might be a texture with land outlines or specific data visualization aspects.
    const textureLoader = new THREE.TextureLoader();
    // Replace the URL with the path to your custom texture that fits the data globe look
    const earthTexture = textureLoader.load("https://ksenia-k.com/img/earth-map-colored.png");

    const sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
    // Adjust the material to make the globe look more modern and data-focused
    const sphereMaterial = new THREE.MeshBasicMaterial({
      map: earthTexture,
      transparent: true, // Ensure transparency is enabled
      opacity: 0.8, // Adjust opacity as needed to make the globe slightly see-through
      side: THREE.DoubleSide // Render both sides of the polygons in the geometry
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    camera.position.z = 15;





    const animate = function () {
      requestAnimationFrame(animate);
      sphere.rotation.y += 0.005; // Rotate the sphere for a spinning effect
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize, false);

    return () => {
      if (globeRef.current && renderer.domElement) {
        globeRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', onWindowResize);
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      controls.dispose();
    };
  }, []);

  return (
    <div className="globeDashboard">
      <div ref={globeRef} className="globeContainer" />
      <div className="sea360Text">Welcome <br></br> to <br></br>SEACO 360</div>
      <div className="sea360Text2">SEACO is a developing longitudinal demographic health surveillance site located in Malaysia. It captures longitudinal biomedical, health, social, educational and environmental data on a population of approximately 70,000 people.</div>
      {/* <button onClick={() => navigate('/page3')} className="navigateButton">START</button> */}
      {/* <div className="inputBx"> */}
                {/* <input type="submit" value="Sign in" /> */}
                <button onClick={() => navigate('/page3')} className="inputBx2">START</button>
    </div>
    // </div>
  );
}

export default GlobeDashboard;








































































// import React, { useRef, useEffect } from 'react';
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import { useNavigate } from 'react-router-dom';
// // import { SphereBufferGeometry } from 'three';

// // Define the fragment shader
// const fragmentShader = `
// uniform sampler2D u_map_tex;
// varying float vOpacity;
// varying vec2 vUv;

// void main() {
//     vec3 color = texture2D(u_map_tex, vUv).rgb;
//     color -= .2 * length(gl_PointCoord.xy - vec2(.5));
//     float dot = 1. - smoothstep(.38, .4, length(gl_PointCoord.xy - vec2(.5)));
//     if (dot < 0.5) discard;
//     gl_FragColor = vec4(color, dot * vOpacity);
// }
// `;

// // Define the vertex shader
// const vertexShader = `
// uniform sampler2D u_map_tex;
// uniform float u_dot_size;
// uniform float u_time_since_click;
// uniform vec3 u_pointer;
// #define PI 3.14159265359
// varying float vOpacity;
// varying vec2 vUv;

// void main() {
//     vUv = uv;
//     float visibility = step(.2, texture2D(u_map_tex, uv).r);
//     gl_PointSize = visibility * u_dot_size;
//     vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
//     vOpacity = (1. / length(mvPosition.xyz) - .7);
//     vOpacity = clamp(vOpacity, .03, 1.);
//     float t = u_time_since_click - .1;
//     t = max(0., t);
//     float max_amp = .15;
//     float dist = 1. - .5 * length(position - u_pointer);
//     float damping = 1. / (1. + 20. * t);
//     float delta = max_amp * damping * sin(5. * t * (1. + 2. * dist) - PI);
//     delta *= 1. - smoothstep(.8, 1., dist);
//     vec3 pos = position;
//     pos *= (1. + delta);
//     gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
// }
// `;

// function GlobeDashboard() {
//   const globeRef = useRef(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//     camera.position.z = 15;

//     const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
//     renderer.setClearColor(0x000000, 0); // Set to transparent
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     globeRef.current.appendChild(renderer.domElement);

//     const controls = new OrbitControls(camera, renderer.domElement);
//     controls.enableDamping = true;
//     controls.dampingFactor = 0.05;
//     controls.autoRotate = true; // Optional: to have the globe rotate automatically

//     const textureLoader = new THREE.TextureLoader();
//     const earthTexture = textureLoader.load('path_to_your_earth_texture.png');

//     const sphereGeometry = new THREE.SphereBufferGeometry(5, 32, 32);

//     const uniforms = {
//       u_map_tex: { value: earthTexture },
//       u_dot_size: { value: 1 },
//       u_time_since_click: { value: 0 },
//       u_pointer: { value: new THREE.Vector3() },
//     };

//     const sphereMaterial = new THREE.ShaderMaterial({
//       uniforms: uniforms,
//       vertexShader: vertexShader,
//       fragmentShader: fragmentShader,
//       transparent: true,
//     });

//     const sphere = new THREE.Points(sphereGeometry, sphereMaterial);
//     scene.add(sphere);

//     const animate = () => {
//       requestAnimationFrame(animate);
//       controls.update();
//       renderer.render(scene, camera);
//     };

//     animate();

//     function onWindowResize() {
//       camera.aspect = window.innerWidth / window.innerHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(window.innerWidth, window.innerHeight);
//     }

//     window.addEventListener('resize', onWindowResize, false);

//     renderer.domElement.addEventListener('click', (event) => {
//       // Logic to handle click and update uniforms for ripple effect
//       // will depend on how you want the effect to be triggered
//     });

//     return () => {
//       globeRef.current.removeChild(renderer.domElement);
//       window.removeEventListener('resize', onWindowResize);
//       sphereGeometry.dispose();
//       sphereMaterial.dispose();
//       controls.dispose();
//     };
//   }, []);

//   return (
//     <div className="globeDashboard">
//       <div ref={globeRef} className="globeContainer"></div>
//       <button onClick={() => navigate('/page3')} className="inputBx2">START</button>
//     </div>
//   );
// }

// export default GlobeDashboard;












































// import React, { useEffect, useRef } from 'react';
// import { Scene, PerspectiveCamera, WebGLRenderer, TextureLoader, SphereGeometry, MeshPhongMaterial, Mesh, PointsMaterial, Points, BufferGeometry, Float32BufferAttribute } from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import * as THREE from 'three';

// const GlobeWithPoints = () => {
//   const globeRef = useRef(null);

//   useEffect(() => {
//     const scene = new Scene();
//     const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//     const renderer = new WebGLRenderer({ antialias: true, alpha: true });
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     globeRef.current.appendChild(renderer.domElement);

//     new OrbitControls(camera, renderer.domElement);

//     const textureLoader = new TextureLoader();
//     const earthTexture = textureLoader.load("https://ksenia-k.com/img/earth-map-colored.png");

//     const sphereGeometry = new SphereGeometry(5, 64, 64);
//     const sphereMaterial = new MeshPhongMaterial({
//       map: earthTexture,
//       transparent: true,
//       opacity: 0.9,
//       side: THREE.DoubleSide
//     });
//     const sphere = new Mesh(sphereGeometry, sphereMaterial);
//     scene.add(sphere);

//     const locations = [
//       [40.712776, -74.005974], // New York
//       [34.052235, -118.243683], // Los Angeles
//       [51.507351, -0.127758], // London
//       [35.689487, 139.691706] // Tokyo
//     ];

//     const pointsMaterial = new PointsMaterial({ color: 0xff0000, size: 0.1 });
//     const pointsGeometry = new BufferGeometry();
//     const positions = [];
//     locations.forEach(([lat, lon]) => {
//       const [x, y, z] = latLongToVector3Array(lat, lon, 5.1);
//       positions.push(x, y, z);
//     });
//     pointsGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));

//     const points = new Points(pointsGeometry, pointsMaterial);
//     scene.add(points);

//     camera.position.z = 15;

//     const animate = () => {
//       requestAnimationFrame(animate);
//       renderer.render(scene, camera);
//     };
//     animate();

//     return () => {
//       globeRef.current.removeChild(renderer.domElement);
//     };
//   }, []);

//   function latLongToVector3Array(lat, lon, radius) {
//     var phi = (90 - lat) * (Math.PI / 180);
//     var theta = (lon + 180) * (Math.PI / 180);

//     var x = -(radius) * Math.sin(phi) * Math.cos(theta);
//     var y = (radius) * Math.cos(phi);
//     var z = (radius) * Math.sin(phi) * Math.sin(theta);

//     return [x, y, z];
//   }

//   return <div ref={globeRef} style={{ width: '100%', height: '100%' }} />;
// };

// export default GlobeWithPoints;









// import React, { useEffect, useRef } from 'react';
// import { Scene, PerspectiveCamera, WebGLRenderer, SphereGeometry, MeshBasicMaterial, Mesh, Vector3, Points, PointsMaterial, BufferGeometry, Float32BufferAttribute } from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import * as THREE from 'three';

// const GlobeWithCountries = () => {
//   const globeRef = useRef(null);

//   useEffect(() => {
//     const scene = new Scene();
//     const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//     const renderer = new WebGLRenderer({ antialias: true, alpha: true });
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     globeRef.current.appendChild(renderer.domElement);

//     const controls = new OrbitControls(camera, renderer.domElement);
//     controls.enableZoom = true;

//     // Globe
//     const sphereGeometry = new SphereGeometry(5, 64, 64);
//     const sphereMaterial = new MeshBasicMaterial({ color: 0x000000, wireframe: true });
//     const globe = new Mesh(sphereGeometry, sphereMaterial);
//     scene.add(globe);

//     // Points for country outlines
//     // Example: Add points for a single country (simplified for illustration)
//     const countryCoords = [[-6.2, 106.8], [-8.7, 115.2]]; // Array of [lat, lon] pairs
//     const pointsMaterial = new PointsMaterial({ color: 0xffffff, size: 0.05 });
//     const pointsGeometry = new BufferGeometry();
//     const positions = countryCoords.flatMap(([lat, lon]) => latLongToVector3(lat, lon, 5.05).toArray());

//     pointsGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
//     const countryOutline = new Points(pointsGeometry, pointsMaterial);
//     scene.add(countryOutline);

//     camera.position.z = 10;

//     const animate = () => {
//       requestAnimationFrame(animate);
//       controls.update();
//       renderer.render(scene, camera);
//     };

//     animate();
//   }, []);

//   // Convert lat-long to vector3
//   function latLongToVector3(lat, lon, radius) {
//     var phi = (90 - lat) * Math.PI / 180;
//     var theta = (lon + 180) * Math.PI / 180;
//     var x = -(radius) * Math.sin(phi) * Math.cos(theta);
//     var y = (radius) * Math.cos(phi);
//     var z = (radius) * Math.sin(phi) * Math.sin(theta);
//     return new Vector3(x, y, z);
//   }

//   return <div ref={globeRef} style={{ width: '100%', height: '100%' }} />;
// };

// export default GlobeWithCountries;






















// import React, { useRef, useEffect } from 'react';
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import gsap from 'gsap';

// function GlobeDashboard() {
//   const containerRef = useRef();
//   const canvas3DRef = useRef();
//   const canvas2DRef = useRef();
//   const popupRef = useRef();

//   useEffect(() => {
//     const containerEl = containerRef.current;
//     const canvas3D = canvas3DRef.current;
//     const canvas2D = canvas2DRef.current;
//     const popupEl = popupRef.current;
//     const overlayCtx = canvas2D.getContext('2d');
//     let coordinates2D = [0, 0];
//     let pointerPos;
//     let dragged = false;
//     let pointer, globeMesh;

//     // const renderer = new THREE.WebGLRenderer({ canvas: canvas3D, alpha: true });
//     // renderer.setPixelRatio(window.devicePixelRatio);
//     // renderer.setSize(containerEl.clientWidth, containerEl.clientHeight);

//        // Renderer
//        const renderer = new THREE.WebGLRenderer({ canvas: canvas3D, alpha: true });
//        renderer.setPixelRatio(window.devicePixelRatio);
//        renderer.setSize(containerEl.clientWidth, containerEl.clientHeight);

//     const scene = new THREE.Scene();
//     const camera = new THREE.OrthographicCamera(-1.1, 1.1, 1.1, -1.1, 0, 3);
//     camera.position.z = 1.1;

//     const rayCaster = new THREE.Raycaster();
//     rayCaster.far = 1.15;
//     const mouse = new THREE.Vector2(-1, -1);
//     const clock = new THREE.Clock();

//     const controls = new OrbitControls(camera, canvas3D);
//     controls.enablePan = false;
//     controls.enableZoom = false;
//     controls.enableDamping = true;
//     controls.minPolarAngle = 0.4 * Math.PI;
//     controls.maxPolarAngle = 0.4 * Math.PI;
//     controls.autoRotate = true;

//     // Placeholder shaders
//     const vertexShader = `
//       void main() {
//         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//       }
//     `;
//     const fragmentShader = `
//       void main() {
//         gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
//       }
//     `;

//     // Setup globe geometry and material
//     const globeGeometry = new THREE.IcosahedronGeometry(1, 22);
//     const mapMaterial = new THREE.ShaderMaterial({
//       vertexShader,
//       fragmentShader,
//       uniforms: {
//         u_map_tex: { value: null }, // Texture will be set after loading
//         u_dot_size: { value: 0 },
//         u_pointer: { value: new THREE.Vector3(0, 0, 1) },
//         u_time_since_click: { value: 0 },
//       },
//       transparent: true,
//     });

//     // Add globe to the scene
//     const globe = new THREE.Points(globeGeometry, mapMaterial);
//     scene.add(globe);

//     // Add globe mesh for raycasting
//     globeMesh = new THREE.Mesh(
//       globeGeometry,
//       new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.05 })
//     );
//     scene.add(globeMesh);

//     // Load texture and create globe
//     new THREE.TextureLoader().load(
//       'https://ksenia-k.com/img/earth-map-colored.png',
//       (texture) => {
//         texture.repeat.set(1, 1);
//         mapMaterial.uniforms.u_map_tex.value = texture;
//         renderer();
//       }
//     );




//     // Create pointer for interaction
//     const pointerGeometry = new THREE.SphereGeometry(0.04, 16, 16);
//     const pointerMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 });
//     pointer = new THREE.Mesh(pointerGeometry, pointerMaterial);
//     scene.add(pointer);

//     // Create animation loop
//     const animate = () => {
//       requestAnimationFrame(animate);
//       controls.update();
//       renderer.render(scene, camera);
//     };



//     // Update size based on window resizing
//     const updateSize = () => {
//       const width = containerEl.clientWidth;
//       const height = containerEl.clientHeight;
//       renderer.setSize(width, height);
//       camera.aspect = width / height;
//       camera.updateProjectionMatrix();
//     };
//     window.addEventListener('resize', updateSize);

//     // Dispose all Three.js objects and remove event listeners
//     return () => {
//       window.removeEventListener('resize', updateSize);
//       globeGeometry.dispose();
//       mapMaterial.dispose();
//       pointerGeometry.dispose();
//       pointerMaterial.dispose();
//       renderer.dispose();
//     };
//   }, []);

//   // Rest of the interactivity and popup logic goes here

//   return (
//     <div ref={containerRef} className="globe-wrapper">
//       <canvas ref={canvas3DRef} id="globe-3d" />
//       <canvas ref={canvas2DRef} id="globe-2d-overlay" />
//       <div ref={popupRef} className="globe-popup" />
//     </div>
//   );
// }

// export default GlobeDashboard;
