# Store Floor Planner

A tiny store floor planner built with React Three Fiber: boxes on a 20x20 floor that you can
select, move with the arrow keys and add from an ordinary HTML panel. Built as a one-evening
refresher on three.js concepts.

## Run

```bash
npm install
npm run dev
```

Drag to orbit, scroll to zoom, click a box to select it, arrow keys move it one grid cell.

## 3D concepts it demonstrates

- **Scene graph** – `<Canvas>` is the root; every JSX element inside is a three.js object in a tree ([Scene.tsx](src/Scene.tsx)).
- **Camera** – a perspective camera placed at a corner above the floor gives the isometric-style view.
- **Lights** – an ambient light fills the scene evenly and a directional light acts as the sun and casts shadows.
- **Mesh = geometry + material** – each fixture is a `boxGeometry` wrapped in a `meshStandardMaterial` ([Fixture.tsx](src/Fixture.tsx)).
- **Raycasting / picking** – R3F raycasts from the camera through the pointer, so `onClick` on a mesh is all it takes to select it; `onPointerMissed` on the canvas deselects.
- **OrbitControls** – the drei helper that turns pointer drags into camera orbit, zoom and pan.
- **Shared state between 3D and HTML** – one zustand store drives both the meshes and the plain HTML list ([store.ts](src/store.ts), [Panel.tsx](src/Panel.tsx)).
- **glTF** – a model from the three.js examples is loaded with `useGLTF` inside `<Suspense>` and mounted with `<primitive>` ([Shopper.tsx](src/Shopper.tsx)).
