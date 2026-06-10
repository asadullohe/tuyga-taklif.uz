import type { OrnamentKind } from "@/types";

type TemplateOrnamentProps = {
  kind: OrnamentKind;
  color: string;
  secondaryColor: string;
  strokeWidth: number;
};

export function TemplateOrnament({
  kind,
  color,
  secondaryColor,
  strokeWidth
}: TemplateOrnamentProps) {
  const line = {
    fill: "none",
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    vectorEffect: "non-scaling-stroke" as const
  };
  const fineLine = {
    ...line,
    strokeWidth: Math.max(0.7, strokeWidth * 0.55)
  };
  const petal = {
    fill: secondaryColor,
    fillOpacity: 0.72,
    stroke: color,
    strokeWidth: Math.max(0.8, strokeWidth * 0.72),
    strokeLinejoin: "round" as const,
    vectorEffect: "non-scaling-stroke" as const
  };
  const wide = kind === "royal-divider";

  return (
    <svg
      viewBox={wide ? "0 0 480 120" : "0 0 240 240"}
      preserveAspectRatio={wide ? "none" : "xMidYMid meet"}
      className="h-full w-full overflow-visible"
      aria-hidden="true"
    >
      {kind === "floral-corner" ? (
        <>
          <path d="M14 226C24 157 52 98 108 52C135 30 166 18 211 14" {...line} />
          <path d="M26 197C44 163 67 132 96 105M66 131C84 100 108 74 138 54M118 66C144 40 170 27 201 21" {...fineLine} opacity=".68" />
          <Leaf x={42} y={164} angle={-54} color={color} fill={secondaryColor} width={strokeWidth} />
          <Leaf x={61} y={137} angle={132} color={color} fill={secondaryColor} width={strokeWidth} />
          <Leaf x={83} y={111} angle={-48} color={color} fill={secondaryColor} width={strokeWidth} />
          <Leaf x={108} y={83} angle={139} color={color} fill={secondaryColor} width={strokeWidth} />
          <Leaf x={139} y={57} angle={-36} color={color} fill={secondaryColor} width={strokeWidth} />
          <Leaf x={170} y={36} angle={146} color={color} fill={secondaryColor} width={strokeWidth} />
          <g transform="translate(116 70)">
            {[0, 72, 144, 216, 288].map((angle) => (
              <ellipse key={angle} cx="0" cy="-13" rx="7" ry="15" transform={`rotate(${angle})`} {...petal} />
            ))}
            <circle r="5.5" fill={color} />
            <circle r="2" fill={secondaryColor} />
          </g>
          <g transform="translate(201 20) scale(.72)">
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <ellipse key={angle} cx="0" cy="-11" rx="5.5" ry="12" transform={`rotate(${angle})`} {...petal} />
            ))}
            <circle r="4" fill={color} />
          </g>
          <path d="M20 216C30 211 38 214 42 222M34 185C26 178 18 179 12 187M151 46C158 49 162 56 161 64" {...fineLine} />
          <circle cx="19" cy="207" r="2.5" fill={color} />
          <circle cx="151" cy="44" r="2.5" fill={color} />
        </>
      ) : null}

      {kind === "olive-branch" ? (
        <>
          <path d="M24 205C75 176 108 128 136 85C158 52 179 29 215 17" {...line} />
          <path d="M31 202C84 170 111 124 139 81C160 49 183 28 215 17" {...fineLine} opacity=".55" />
          {[
            [52, 183, -43, 1],
            [70, 165, 139, 0.92],
            [85, 147, -40, 1.04],
            [103, 124, 142, 0.9],
            [119, 101, -35, 1],
            [137, 78, 148, 0.84],
            [155, 58, -28, 0.9],
            [177, 39, 155, 0.72]
          ].map(([x, y, angle, scale]) => (
            <Leaf
              key={`${x}-${y}`}
              x={x}
              y={y}
              angle={angle}
              scale={scale}
              color={color}
              fill={secondaryColor}
              width={strokeWidth}
            />
          ))}
          <path d="M73 164C60 151 48 147 35 151M106 120C93 105 80 101 67 105M141 77C128 65 116 62 104 68M174 41C162 30 152 28 142 33" {...fineLine} />
          <circle cx="65" cy="171" r="4.5" fill={secondaryColor} stroke={color} strokeWidth={strokeWidth * 0.7} />
          <circle cx="98" cy="128" r="4" fill={secondaryColor} stroke={color} strokeWidth={strokeWidth * 0.7} />
          <circle cx="132" cy="85" r="3.5" fill={secondaryColor} stroke={color} strokeWidth={strokeWidth * 0.7} />
        </>
      ) : null}

      {kind === "royal-divider" ? (
        <>
          <path d="M8 60H168M312 60H472" {...fineLine} />
          <path d="M8 54H154C175 54 186 48 197 37M472 54H326C305 54 294 48 283 37" {...line} />
          <path d="M8 66H154C175 66 186 72 197 83M472 66H326C305 66 294 72 283 83" {...line} />
          <path d="M240 15C249 34 265 43 286 45C279 60 266 68 251 71C250 86 246 98 240 108C234 98 230 86 229 71C214 68 201 60 194 45C215 43 231 34 240 15Z" {...petal} />
          <path d="M240 31L248 53L270 60L248 67L240 89L232 67L210 60L232 53Z" fill="none" stroke={color} strokeWidth={strokeWidth} />
          <circle cx="240" cy="60" r="5" fill={color} />
          <circle cx="240" cy="60" r="2" fill={secondaryColor} />
          <path d="M173 60C184 58 191 53 198 45M307 60C296 58 289 53 282 45" {...fineLine} />
          {[126, 146, 334, 354].map((x) => <circle key={x} cx={x} cy="60" r="2.4" fill={color} />)}
        </>
      ) : null}

      {kind === "islamic-arch" ? (
        <>
          <path d="M32 225V102C32 59 66 24 120 10C174 24 208 59 208 102V225" {...line} />
          <path d="M47 225V106C47 71 72 43 120 28C168 43 193 71 193 106V225" stroke={secondaryColor} strokeWidth={strokeWidth * 1.25} fill="none" />
          <path d="M61 225V112C61 82 82 60 120 46C158 60 179 82 179 112V225" {...fineLine} />
          <path d="M120 10L129 25L120 40L111 25Z" {...petal} />
          <path d="M32 164H61M179 164H208M47 181H61M179 181H193" {...fineLine} opacity=".7" />
          {[72, 96, 120, 144, 168].map((x, index) => (
            <g key={x} transform={`translate(${x} 205)`}>
              <path d="M0 18V-4" {...fineLine} />
              <path d="M-5 2L0-7L5 2L0 7Z" fill={index === 2 ? color : secondaryColor} stroke={color} strokeWidth={strokeWidth * 0.5} />
            </g>
          ))}
          <path d="M76 225V216C76 191 96 171 120 171C144 171 164 191 164 216V225" {...line} />
          <circle cx="120" cy="73" r="3.5" fill={color} />
          <circle cx="120" cy="73" r="9" fill="none" stroke={secondaryColor} strokeWidth={strokeWidth * 0.6} />
        </>
      ) : null}

      {kind === "art-deco-fan" ? (
        <>
          <path d="M20 218H220M31 208H209" {...line} />
          <path d="M40 208A80 80 0 0 1 200 208M56 208A64 64 0 0 1 184 208M74 208A46 46 0 0 1 166 208" {...fineLine} />
          <path d="M120 208L41 191M120 208L55 159M120 208L79 134M120 208V122M120 208L161 134M120 208L185 159M120 208L199 191" {...line} />
          <path d="M120 121L129 143L120 157L111 143Z" {...petal} />
          <path d="M79 134L91 151L87 167L72 157ZM161 134L149 151L153 167L168 157Z" {...petal} />
          <path d="M55 159L70 170L70 184L50 179ZM185 159L170 170L170 184L190 179Z" {...petal} />
          <circle cx="120" cy="208" r="10" fill={secondaryColor} stroke={color} strokeWidth={strokeWidth} />
          <circle cx="120" cy="208" r="3.5" fill={color} />
        </>
      ) : null}

      {kind === "sparkle-cluster" ? (
        <>
          <DiamondStar x={112} y={104} size={76} color={color} fill={secondaryColor} width={strokeWidth} />
          <DiamondStar x={179} y={55} size={30} color={color} fill={secondaryColor} width={strokeWidth * 0.75} />
          <DiamondStar x={181} y={165} size={23} color={color} fill={secondaryColor} width={strokeWidth * 0.65} />
          <DiamondStar x={48} y={166} size={37} color={color} fill={secondaryColor} width={strokeWidth * 0.75} />
          <path d="M31 82L38 96L52 103L38 110L31 124L24 110L10 103L24 96Z" fill={color} opacity=".88" />
          <circle cx="54" cy="48" r="5" fill={secondaryColor} stroke={color} strokeWidth={strokeWidth} />
          <circle cx="205" cy="113" r="4" fill={color} />
          <circle cx="89" cy="202" r="3" fill={color} />
          <path d="M65 71C82 49 104 38 130 37M133 174C151 182 168 183 185 177" {...fineLine} opacity=".45" />
        </>
      ) : null}

      {kind === "wax-seal" ? (
        <>
          <path
            d="M120 13L137 25L158 21L168 40L190 46L191 68L208 82L201 103L211 122L198 140L202 162L183 173L178 195L156 198L141 215L120 207L99 215L84 198L62 195L57 173L38 162L42 140L29 122L39 103L32 82L49 68L50 46L72 40L82 21L103 25Z"
            fill={secondaryColor}
            fillOpacity=".78"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <circle cx="120" cy="116" r="67" fill="none" stroke={color} strokeWidth={strokeWidth * 1.4} />
          <circle cx="120" cy="116" r="57" fill="none" stroke={color} strokeWidth={strokeWidth * 0.55} opacity=".72" />
          <path d="M79 142L120 70L161 142M94 116H146" {...line} />
          <path d="M120 70C112 86 99 98 81 107M120 70C128 86 141 98 159 107" {...fineLine} opacity=".75" />
          <circle cx="120" cy="116" r="5" fill={color} />
          <path d="M67 80C77 68 88 60 102 55M173 80C163 68 152 60 138 55M72 160C84 170 96 176 109 178M168 160C156 170 144 176 131 178" {...fineLine} />
        </>
      ) : null}

      {kind === "double-ring" ? (
        <>
          <circle cx="94" cy="119" r="58" fill="none" stroke={color} strokeWidth={strokeWidth * 1.3} />
          <circle cx="146" cy="119" r="58" fill="none" stroke={secondaryColor} strokeWidth={strokeWidth * 1.3} />
          <circle cx="94" cy="119" r="50" fill="none" stroke={secondaryColor} strokeWidth={strokeWidth * 0.55} opacity=".7" />
          <circle cx="146" cy="119" r="50" fill="none" stroke={color} strokeWidth={strokeWidth * 0.55} opacity=".7" />
          <path d="M30 178C60 205 89 212 120 207C151 212 180 205 210 178" {...line} />
          <Leaf x={58} y={190} angle={-122} scale={0.72} color={color} fill={secondaryColor} width={strokeWidth} />
          <Leaf x={82} y={202} angle={-104} scale={0.7} color={color} fill={secondaryColor} width={strokeWidth} />
          <Leaf x={182} y={190} angle={122} scale={0.72} color={color} fill={secondaryColor} width={strokeWidth} />
          <Leaf x={158} y={202} angle={104} scale={0.7} color={color} fill={secondaryColor} width={strokeWidth} />
          <path d="M120 31L128 47L145 55L128 63L120 80L112 63L95 55L112 47Z" {...petal} />
          <circle cx="120" cy="55" r="4" fill={color} />
        </>
      ) : null}
    </svg>
  );
}

function Leaf({
  x,
  y,
  angle,
  scale = 1,
  color,
  fill,
  width
}: {
  x: number;
  y: number;
  angle: number;
  scale?: number;
  color: string;
  fill: string;
  width: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      <path
        d="M0 0C10-17 27-20 39-11C31 7 16 13 0 0Z"
        fill={fill}
        fillOpacity=".68"
        stroke={color}
        strokeWidth={Math.max(0.8, width * 0.72)}
        vectorEffect="non-scaling-stroke"
      />
      <path d="M3-1C14-7 24-10 34-11" fill="none" stroke={color} strokeWidth={Math.max(0.6, width * 0.42)} vectorEffect="non-scaling-stroke" />
    </g>
  );
}

function DiamondStar({
  x,
  y,
  size,
  color,
  fill,
  width
}: {
  x: number;
  y: number;
  size: number;
  color: string;
  fill: string;
  width: number;
}) {
  const half = size / 2;
  const narrow = size * 0.13;
  return (
    <path
      d={`M${x} ${y - half}C${x + narrow} ${y - narrow} ${x + narrow} ${y - narrow} ${x + half} ${y}C${x + narrow} ${y + narrow} ${x + narrow} ${y + narrow} ${x} ${y + half}C${x - narrow} ${y + narrow} ${x - narrow} ${y + narrow} ${x - half} ${y}C${x - narrow} ${y - narrow} ${x - narrow} ${y - narrow} ${x} ${y - half}Z`}
      fill={fill}
      fillOpacity=".74"
      stroke={color}
      strokeWidth={width}
      vectorEffect="non-scaling-stroke"
    />
  );
}
