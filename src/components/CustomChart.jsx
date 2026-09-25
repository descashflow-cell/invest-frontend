import { useCallback, useEffect, useRef, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

const PERIOD_WIDTH = 90;
const DRAG_THRESHOLD = 5;

function CustomChart({
  chartData,
  filterType,
  invIncl,
  fmtAxis,
  Tip,
  ALLTIME_TYPE,
}) {
  const viewportRef = useRef(null);

  const dragRef = useRef({
    pointerId: null,
    startX: 0,
    startOffset: 0,
    isDragging: false,
  });

  const [viewportWidth, setViewportWidth] = useState(0);
  const [offset, setOffset] = useState(0);

  /*
   * Il grafico diventa più largo del viewport solamente
   * quando abbiamo abbastanza dati da dover scorrere.
   */
  const isScrollable =
    filterType?.name === ALLTIME_TYPE.name && chartData.length > 10;

  const chartWidth = isScrollable
    ? Math.max(viewportWidth, chartData.length * PERIOD_WIDTH)
    : viewportWidth;

  /*
   * Offset minimo consentito.
   *
   * Esempio:
   * viewport = 1000px
   * chart    = 1800px
   *
   * minOffset = 1000 - 1800 = -800
   *
   * Quindi possiamo muoverci da:
   * 0px -> -800px
   */
  const minOffset = Math.min(0, viewportWidth - chartWidth);

  /*
   * Misuriamo la larghezza reale del contenitore.
   * In questo modo continuiamo ad avere un comportamento responsive.
   */
  useEffect(() => {
    const element = viewportRef.current;

    if (!element) return;

    const updateSize = () => {
      setViewportWidth(element.clientWidth);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  /*
   * Quando cambiano i dati o la larghezza del contenitore,
   * riportiamo la visualizzazione alla fine del grafico.
   *
   * In questo modo, con ALLTIME, partiamo dagli ultimi 10 periodi.
   */
  useEffect(() => {
    if (isScrollable) {
      setOffset(minOffset);
    } else {
      setOffset(0);
    }
  }, [isScrollable, chartData.length, minOffset]);

  /*
   * Mantiene l'offset sempre dentro i limiti del grafico.
   */
  const clampOffset = useCallback(
    (value) => {
      return Math.min(0, Math.max(minOffset, value));
    },
    [minOffset],
  );

  /*
   * Inizio del drag.
   */
  const handlePointerDown = (event) => {
    if (!isScrollable) return;

    // Solo click sinistro del mouse
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startOffset: offset,
      isDragging: false,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  /*
   * Movimento del drag.
   */
  const handlePointerMove = (event) => {
    if (!isScrollable) return;

    if (dragRef.current.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragRef.current.startX;

    // Non consideriamo ancora il movimento come drag
    if (!dragRef.current.isDragging) {
      if (Math.abs(deltaX) < DRAG_THRESHOLD) {
        return;
      }

      dragRef.current.isDragging = true;
    }

    const newOffset = dragRef.current.startOffset + deltaX;

    setOffset(clampOffset(newOffset));
  };

  /*
   * Fine del drag.
   */
  const handlePointerUp = (event) => {
    if (dragRef.current.pointerId !== event.pointerId) {
      return;
    }

    dragRef.current.pointerId = null;
    dragRef.current.isDragging = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Area grafico scrollabile */}
      <div
        ref={viewportRef}
        className={`w-full h-full overflow-hidden ${
          isScrollable ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          touchAction: isScrollable ? "pan-y" : "auto",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        <div
          style={{
            width: `${chartWidth}px`,
            height: "100%",
            transform: `translateX(${offset}px)`,
            transition:
              dragRef.current.pointerId === null
                ? "transform 120ms ease-out"
                : "none",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 12,
                right: 0,
                bottom: 0,
                left: -10,
              }}
            >
              <CartesianGrid
                strokeDasharray="2 4"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                stroke="#525252"
                tick={{
                  fontSize: 11,
                  fill: "#737373",
                }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="#525252"
                tick={{
                  fontSize: 10,
                  fill: "#737373",
                }}
                tickFormatter={fmtAxis}
                tickLine={false}
                axisLine={false}
                width={48}
              />

              <Tooltip
                content={<Tip invIncl={invIncl} />}
                cursor={{
                  fill: "rgba(255,255,255,0.03)",
                }}
              />

              <Bar
                dataKey="income"
                name="Income"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                barSize={17}
              />

              <Bar
                dataKey="expenses"
                name="Expenses"
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
                barSize={17}
              />

              <Bar
                dataKey="invested"
                name="Invested"
                fill="#38BDF8"
                radius={[4, 4, 0, 0]}
                barSize={17}
              />

              <Bar
                dataKey={invIncl ? "saved" : "balance"}
                name="Net Revenue"
                fill="#FACC15"
                radius={[4, 4, 0, 0]}
                barSize={17}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Legenda fissa */}
      <div className="shrink-0 flex justify-center gap-5 pt-2 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#10B981]" />
          <span className="text-neutral-400">Income</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
          <span className="text-neutral-400">Expenses</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#38BDF8]" />
          <span className="text-neutral-400">Invested</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#FACC15]" />
          <span className="text-neutral-400">Net Revenue</span>
        </div>
      </div>
    </div>
  );
}

export default CustomChart;
