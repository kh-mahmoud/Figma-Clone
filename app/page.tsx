'use client'

import devLive from "@/components/Live";
import Navbar from "@/components/Navbar";
import RightSidebar from "@/components/RightSidebar";
import { useEffect, useRef, useState } from "react";
import { fabric } from 'fabric';
import { handleCanvaseMouseMove, handleCanvasMouseDown, handleCanvasMouseUp, handleCanvasObjectModified, handleCanvasObjectMoving, handleCanvasSelectionCreated, handlePathCreated, handleResize, initializeFabric, renderCanvas } from "@/lib/canvas";
import { ActiveElement, Attributes } from "@/types/type";
import { useMutation, useRedo, useStorage, useUndo } from "@liveblocks/react";
import { defaultNavElement } from "@/constants";
import { handleDelete, handleKeyDown } from "@/lib/key-events";
import LeftSidebar from "@/components/LeftSidebar";
import { handleImageUpload } from "@/lib/shapes";
import Live from "@/components/Live";


export default function Page() {

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<fabric.Canvas | null>(null)
  const isDrawing = useRef(true)
  const shapeRef = useRef<fabric.Object | null>(null)
  const selectedShapeRef = useRef<string | null>(null)
  const [ActiveElement, setActiveElement] = useState<ActiveElement>({
    name: '',
    value: '',
    icon: ''
  })
  const activeObjectRef = useRef<fabric.Object | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const canvasObjects = useStorage((root) => root.canvasObjects);
  const isEditingRef = useRef(false)
  const [elementAttributes, setElementAttributes] = useState<Attributes>({
    width: "",
    height: "",
    fontSize: "",
    fontFamily: "",
    fontWeight: "",
    fill: "#aabbcc",
    stroke: "#aabbcc",
  });

  const undo = useUndo();
  const redo = useRedo();

  //delete all shapes in the canvas and the storage
  const deleteAllShapes = useMutation(({ storage }) => {
    // get the canvasObjects store
    const canvasObjects = storage.get("canvasObjects");

    // if the store doesn't exist or is empty, return
    if (!canvasObjects || canvasObjects.size === 0) return true;

    // delete all the shapes from the store
    //@ts-ignore
    for (const [key, value] of canvasObjects.entries()) {
      canvasObjects.delete(key);
    }

    // return true if the store is empty
    return canvasObjects.size === 0;
  }, []);


  const deleteShapeFromStorage = useMutation(({ storage }, shapeId) => {

    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.delete(shapeId);
  }, []);


  //nav bar active element
  const handleActiveElement = (elem: ActiveElement) => {
    setActiveElement(elem);

    switch (elem?.value) {
      // delete all the shapes from the canvas
      case "reset":
        // clear the storage
        deleteAllShapes();
        // clear the canvas
        fabricRef.current?.clear();
        // set "select" as the active element
        setActiveElement(defaultNavElement);
        break;

      // delete the selected shape from the canvas
      case "delete":
        // delete it from the canvas
        handleDelete(fabricRef.current as any, deleteShapeFromStorage);
        // set "select" as the active element
        setActiveElement(defaultNavElement);
        break;

      // upload an image to the canvas
      case "image":
        // trigger the click event on the input element which opens the file dialog
        imageInputRef.current?.click();
        /**
         * set drawing mode to false
         * If the user is drawing on the canvas, we want to stop the
         * drawing mode when clicked on the image item from the dropdown.
         */
        isDrawing.current = false;

        if (fabricRef.current) {
          // disable the drawing mode of canvas
          fabricRef.current.isDrawingMode = false;
        }
        break;

      // for comments, do nothing
      case "comments":
        break;

      default:
        // set the selected shape to the selected element
        selectedShapeRef.current = elem?.value as string;
        break;
    }
  };

  //store the shape info into liveblocks storage
  const syncShapeInStorage = useMutation(({ storage }, object) => {

    if (!object) return;
    const { objectId } = object;

    //transaforme the object to json
    const shapeData = object.toJSON();
    shapeData.objectId = objectId;

    const canvasObjects = storage.get("canvasObjects");
    //store object in liveblocks storage
    canvasObjects.set(objectId, shapeData);
  }, []);


  //init canvas and track movements
  useEffect(() => {

    const canvas = initializeFabric({ canvasRef, fabricRef });

    canvas.on('mouse:down', function (options) {
      handleCanvasMouseDown({ options, canvas, isDrawing, shapeRef, selectedShapeRef })
    });

    canvas.on('mouse:move', function (options) {
      handleCanvaseMouseMove({ options, canvas, isDrawing, shapeRef, selectedShapeRef, syncShapeInStorage })
    });

    canvas.on('mouse:up', function (options) {
      handleCanvasMouseUp({ canvas, isDrawing, shapeRef, selectedShapeRef, syncShapeInStorage, setActiveElement, activeObjectRef })
    });

    canvas.on("object:modified", (options) => {
      handleCanvasObjectModified({
        options,
        syncShapeInStorage,
      });
    });

    canvas?.on("object:moving", (options) => {
      handleCanvasObjectMoving({
        options,
      });
    });

    canvas.on("selection:created", (options) => {
      handleCanvasSelectionCreated({
        options,
        isEditingRef,
        setElementAttributes,
      });
    });

    canvas.on("path:created", (options) => {
      handlePathCreated({
        options,
        syncShapeInStorage,
      });
    });


    window.addEventListener('resize', () => {
      // @ts-ignore
      handleResize({ fabricRef })
    })

    window.addEventListener("keydown", (e) =>
      handleKeyDown({
        e,
        canvas: fabricRef.current,
        undo,
        redo,
        syncShapeInStorage,
        deleteShapeFromStorage,
      })
    );

    return () => {
      canvas.dispose();
      window.removeEventListener('resize', () => {
        // @ts-ignore
        handleResize({ fabricRef })
      })

      window.removeEventListener("keydown", (e) =>
        handleKeyDown({
          e,
          canvas: fabricRef.current,
          undo,
          redo,
          syncShapeInStorage,
          deleteShapeFromStorage,
        })
      );
    }



  }, []);


  // render the canvas when the canvasObjects from live storage changes
  useEffect(() => {
    renderCanvas({
      fabricRef,
      canvasObjects,
      activeObjectRef,
    });
  }, [canvasObjects]);


  return (
    <main className="h-screen overflow-hidden">

      <Navbar
        activeElement={ActiveElement}
        handleActiveElement={handleActiveElement}
        imageInputRef={imageInputRef}
        handleImageUpload={(e: any) => {
          // prevent the default behavior of the input element
          e.stopPropagation();

          handleImageUpload({
            file: e.target.files[0],
            canvas: fabricRef as any,
            shapeRef,
            syncShapeInStorage,
          });

        }}

      />

      <section style={{ cursor: `url('/assets/Cursor.svg'), auto` }} className="h-full flex flex-row overflow-hidden">
        <LeftSidebar allShapes={canvasObjects ? Array.from(canvasObjects) : []} />
        <Live canvasRef={canvasRef} />
        <RightSidebar
          elementAttributes={elementAttributes}
          setElementAttributes={setElementAttributes}
          fabricRef={fabricRef}
          isEditingRef={isEditingRef}
          activeObjectRef={activeObjectRef}
          syncShapeInStorage={syncShapeInStorage}
        />
      </section>




    </main>
  );
}