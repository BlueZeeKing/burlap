import { useEffect, useState } from "react";

export default function Resizer(props: {width: number, setWidth: (a: number) => void}) {
  const [isMouseDown, setMouseDown] = useState(false);

  useEffect(() => {
    const mouseUpHandler = () => {
      setMouseDown(false);
    };

    window.addEventListener("mouseup", mouseUpHandler);

    return () => window.removeEventListener("mouseup", mouseUpHandler);
  }, []);

  useEffect(() => {
    const mouseMoveHandler = (e) => {
      pauseEvent(e);
      if (isMouseDown) {
        props.setWidth(e.clientX);
      }
    };

    window.addEventListener("mousemove", mouseMoveHandler);

    return () => window.removeEventListener("mousemove", mouseMoveHandler);
  }, [isMouseDown, props]);

  return (
    <div
      className="h-full absolute right-0 w-4 cursor-col-resize top-0 translate-x-[50%] px-[0.37rem]"
      onMouseDown={() => setMouseDown(true)}
    >
      <div
        className={`${
          isMouseDown ? "bg-opacity-100" : "bg-opacity-0"
        } bg-sky-500 w-full h-full transition duration-200`}
      />
    </div>
  );
}

function pauseEvent(e) {
  if (e.stopPropagation) e.stopPropagation();
  if (e.preventDefault) e.preventDefault();
  e.cancelBubble = true;
  e.returnValue = false;
  return false;
}
