import { ReactNode } from "react";

export default function PrefetchWrapper(props: {children: ReactNode; prefetch: () => void; className?: string}) {
  const handleMove = (e) => {
    if (e.movementX == 0 && e.movementY == 0) {
      props.prefetch()
    }
  }
  return (
    <div onMouseMove={handleMove} className={props.className}>
      {props.children}
    </div>
  )
}