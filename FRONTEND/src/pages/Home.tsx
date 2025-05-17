import React from "react";
import Carousel from "../components/Carousel/Carousel";
import Header from "../components/Header/Header";
import QRScanner from "../components/QRScanner/QRScanner";

export function Home() {
  return (
    <>
      <div
        className="flex flex-col w-full"
        style={{ height: "calc(100dvh - 55px)" }}
      >
        <Carousel />
        <QRScanner />
      </div>
    </>
  );
}
