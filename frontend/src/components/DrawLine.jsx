import React, { useEffect, useState } from "react";
import { Line } from "react-konva";

function DrawLine({ buildings }) {
  const [waveOffset, setWaveOffset] = useState(0);

  useEffect(() => {
    const anim = setInterval(() => {
      setWaveOffset((prev) => (prev + 1) % 40);
    }, 100);
    return () => clearInterval(anim);
  }, []);

  const typeOffsets = {
    electricity: 15,
    water: 0,
    internet: -15,
  };

  const getLinesByType = (type, color) => {
    const linesMap = new Map();

    buildings.forEach((building) => {
      building.links
        .filter((link) => link.type === type)
        .forEach((link) => {
          const targetBuilding = buildings.find((b) => b.id === link.targetId);
          if (!targetBuilding) return;

          const keyAtoB = `${building.id}-${link.targetId}`;
          const keyBtoA = `${link.targetId}-${building.id}`;
          const existingReverse = linesMap.get(keyBtoA);

          const offsetAmount = typeOffsets[type];

          // Get current positions (using either coords or realtime position)
          const buildingX = building.realTimePosition
            ? building.realTimePosition.x
            : building.coords.x;
          const buildingY = building.realTimePosition
            ? building.realTimePosition.y
            : building.coords.y;
          const targetX = targetBuilding.realTimePosition
            ? targetBuilding.realTimePosition.x
            : targetBuilding.coords.x;
          const targetY = targetBuilding.realTimePosition
            ? targetBuilding.realTimePosition.y
            : targetBuilding.coords.y;

          const dx = targetX - buildingX;
          const dy = targetY - buildingY;
          const length = Math.sqrt(dx * dx + dy * dy);

          const normalX = (dy / length) * offsetAmount;
          const normalY = (-dx / length) * offsetAmount;

          let offsetX = normalX;
          let offsetY = normalY;

          if (existingReverse) {
            offsetX *= -1.5;
            offsetY *= -1.5;
          }

          const startX = buildingX + 100 + offsetX;
          const startY = buildingY + 150 + offsetY;
          const endX = targetX + 100 + offsetX;
          const endY = targetY + 150 + offsetY;

          linesMap.set(keyAtoB, {
            points: [startX, startY, endX, endY],
            color,
          });
        });
    });

    return Array.from(linesMap.values());
  };

  return (
    <>
      {["electricity", "water", "internet"].map((type) => {
        const color =
          type === "electricity"
            ? "yellow"
            : type === "water"
              ? "blue"
              : "grey";
        return getLinesByType(type, color).map((line, index) => (
          <Line
            key={`${type}-${index}`}
            points={line.points}
            stroke={line.color}
            strokeWidth={3}
            lineCap="round"
            dash={[15, 5]}
            dashOffset={waveOffset * 2}
          />
        ));
      })}
    </>
  );
}

export default DrawLine;
