# Store Floor Planner

A tiny store floor planner built with React Three Fiber: shelves and tables on a 20x20 floor that
you can select, move with the arrow keys and add from an ordinary HTML panel. Select a fixture and
the panel turns into a small planogram editor: pick products from a catalog per shelf level and they are placed as
facings on that level (width and height are checked); click a facing to remove it.
Built as a short refresher on three.js concepts.

![Screenshot](screenshot.jpg)

## Run

```bash
npm install
npm run dev
```

Drag a fixture to move it (or select it and use the arrow keys), drag the floor to orbit, scroll
to zoom. "Show 2D plan" switches to a top-down orthographic floor plan.
With a fixture selected, use the "+ Product" buttons in the panel to fill its shelves.

## 3D concepts it demonstrates

- **Scene graph** – `<Canvas>` is the root; every JSX element inside is a three.js object in a tree ([Scene.tsx](src/Scene.tsx)).
- **Parent/child transforms** – each fixture is a `<group>`; its planks and products are children positioned relative to it, so moving the group moves everything on the shelf ([Fixture.tsx](src/Fixture.tsx)).
- **Cameras** – a perspective camera at a corner above the floor gives the 3D view; an orthographic camera straight above gives a true-to-scale 2D floor plan, and `makeDefault` switches between them.
- **Lights** – an ambient light fills the scene evenly, a directional light acts as the sun and casts shadows (with a shadow bias to avoid acne), and `<Environment>` adds image-based lighting from an HDRI so PBR materials get realistic reflections.
- **Mesh = geometry + material** – each fixture is a `boxGeometry` wrapped in a `meshStandardMaterial` ([Fixture.tsx](src/Fixture.tsx)).
- **Raycasting / picking** – R3F raycasts from the camera through the pointer, so a pointer handler on the fixture group is all it takes to select it (events bubble from the hit product mesh up to the group); `onPointerMissed` on the canvas deselects.
- **Dragging in world space** – the pointer event carries the ray; intersecting it with the floor plane (`ray.intersectPlane`) turns a 2D cursor into a 3D floor point, which works for both cameras. OrbitControls is paused while dragging.
- **OrbitControls** – the drei helper that turns pointer drags into camera orbit, zoom and pan.
- **Loader progress in plain HTML** – drei's `useProgress` exposes three.js loading progress to any React component, so the "Loading" indicator is ordinary DOM layered over the canvas.
- **Shared state between 3D and HTML** – one zustand store drives both the meshes and the plain HTML list; the planogram editor is ordinary React that writes to the same store ([store.ts](src/store.ts), [Panel.tsx](src/Panel.tsx)).
- **glTF** – a display chair (the Khronos "SheenChair" sample asset in `public/`) is loaded with `useGLTF` inside `<Suspense>` and mounted with `<primitive>` ([DisplayItem.tsx](src/DisplayItem.tsx)).
