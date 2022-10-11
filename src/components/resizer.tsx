import { MutableRefObject, useEffect, useState } from "react";

export default function Resizer(props: {
  width: number;
  setWidth: (a: number) => void;
  horizontal?: boolean;
  parentRef?: MutableRefObject<HTMLDivElement>;
}) {
  const [isMouseDown, setMouseDown] = useState(false);

  useEffect(() => {
    const mouseUpHandler = () => {
      setMouseDown(false);
    };

    window.addEventListener("mouseup", mouseUpHandler);

    return () => window.removeEventListener("mouseup", mouseUpHandler);
  }, [props.parentRef]);

  useEffect(() => {
    const mouseMoveHandler = (e) => {
      pauseEvent(e);
      if (isMouseDown) {
        props.setWidth(
          !props.horizontal
            ? (e.pageX -
                (props.parentRef != undefined
                  ? props.parentRef.current.getBoundingClientRect().left
                  : 0)
            ):( e.pageY -
                (props.parentRef != undefined
                  ? props.parentRef.current.getBoundingClientRect().top
                  : 0))
        );
      }
    };

    window.addEventListener("mousemove", mouseMoveHandler);

    return () => window.removeEventListener("mousemove", mouseMoveHandler);
  }, [isMouseDown, props]);

  return (
    <div
      className={`${
        props.horizontal
          ? "w-full -translate-y-[50%] cursor-row-resize h-4 py-[0.37rem]"
          : "h-full translate-x-[50%] cursor-col-resize w-4 px-[0.37rem]"
      } absolute right-0 top-0`}
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
