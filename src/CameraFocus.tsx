import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { useStore } from "./store";

// The part of OrbitControls this component needs; useThree types `controls` loosely.
type Controls = { target: Vector3; update: () => void };

// Glides the camera to the fixture asked for with focus(). OrbitControls orbits around `target`,
// so moving the target and the camera by the same step pans the view while keeping its angle.
export function CameraFocus() {
  const focusTarget = useStore((s) => s.focusTarget);
  const controls = useThree((s) => s.controls) as unknown as Controls | null;
  const goal = useRef<Vector3 | null>(null);

  useEffect(() => {
    if (focusTarget) goal.current = new Vector3(focusTarget[0], 0, focusTarget[1]);
  }, [focusTarget]);

  // useFrame runs before every rendered frame. Each frame covers a share of the remaining distance,
  // which eases out; scaling by delta keeps the speed the same at any frame rate.
  useFrame((state, delta) => {
    if (!goal.current || !controls) return;
    if (useStore.getState().dragging) return void (goal.current = null); // a moving camera would make the drag jump
    const step = goal.current.clone().sub(controls.target).multiplyScalar(1 - Math.exp(-delta * 6));
    controls.target.add(step);
    state.camera.position.add(step);
    controls.update();
    if (controls.target.distanceTo(goal.current) < 0.01) goal.current = null;
  });

  return null;
}
