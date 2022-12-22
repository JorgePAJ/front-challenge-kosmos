import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";
import "./styles.css";

// App is the parent component
const App = () => {
  const [data, setData] = useState(null);

  // Fetch data from an API
  fetch("https://jsonplaceholder.typicode.com/photos/")
    .then((response) => response.json())
    .then((data) => setData(data));

  // Save the data in a state variable
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    // Add a new moveable component to the array
    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
      },
    ]);
  };

  // Update the moveable component
  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  // Handle the resize start event
  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  // Render the moveable components
  return (
    <main
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <button
        onClick={addMoveable}
        style={{
          display: "inline-flex",
          paddingTop: ".5rem",
          paddingBottom: ".5rem",
          paddingLeft: "0.75rem",
          paddingRight: "0.75rem",
          backgroundColor: "#4F46E5",
          color: "#ffffff",
          fontSize: "0.75rem",
          marginBottom: "1rem",
          lineHeight: "1rem",
          fontWeight: "500",
          alignItems: "center",
          borderRadius: "9999px",
          borderWidth: "1px",
          borderColor: "transparent",
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          
          //
        }}
      >
        Add Moveable
      </button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          borderRadius: "0.5rem",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
            data={data[index]}
            setMoveableComponents={setMoveableComponents}
            moveableComponents={moveableComponents}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  setMoveableComponents,
  moveableComponents,
  color,
  id,
  data,
  setSelected,
  isSelected = false,
  updateEnd,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  // Handle the resize event and update the moveable component
  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };
// Handle the drag event and update the moveable component position and the reference node position
  const onDrag = async (e) => {
    const { target, beforeTranslate } = e;
    const [translateX, translateY] = beforeTranslate;

    const absoluteTop = top + translateY;
    const absoluteLeft = left + translateX;

    if (absoluteTop < 0 || absoluteLeft < 0) return;

    const positionMaxTop = absoluteTop + height;
    const positionMaxLeft = absoluteLeft + width;

    if (positionMaxTop > parentBounds?.height) return;
    if (positionMaxLeft > parentBounds?.width) return;

    target.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: absoluteTop,
      left: absoluteLeft,
    });
  };

  // Handle the onResizeEnd event and update the moveable component position and the reference node position
  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top;
    const absoluteLeft = left;

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
      },
      true
    );
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
          objectFit: "contain",
          borderRadius: "5px",

        }}
        onClick={() => setSelected(id)}
      >
        <span
          // Deletes the component from the moveableComponents array and updates the state to rerender the components in the canvas.
          onClick={() => {

            const newMoveableComponents = moveableComponents.filter(
              (item) => item.id !== id
            );

            setMoveableComponents(newMoveableComponents);

          }}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            cursor: "pointer",
            background: "white",
            padding: "5px",
            margin: "-5px",
            width: "20px",
            height: "20px",
            textAlign: "center",
            borderRadius: "100%",
            color: "red",
            rotate: "45deg",
          }}
        >
          +
        </span>
        {/* Render the image in the component   */}
        <img
          src={data.url}
          style={{
            objectFit: "cover",
            height: "100%",
            width: "100%",
            borderRadius: "5px",
          }}
        />
      </div>

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        container={parent}
        snapContainer={parent}
        onDrag={onDrag}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
