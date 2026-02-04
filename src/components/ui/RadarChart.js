/**
 * ETHEREAL v8.0 OMNI — RADAR CHART (ADN Olfativo)
 * ==================================================
 * Gráfico radar SVG puro que muestra el perfil olfativo
 * del usuario basado en sus protocolos y preferencias.
 *
 * Ejes: Floral, Oriental, Amaderado, Fresco, Cítrico, Fougère
 *
 * CAPA: SINGULARITY v5
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { THEME } from './SharedComponents';

const DEFAULT_AXES = [
  { key: 'floral', label: 'Floral' },
  { key: 'oriental', label: 'Oriental' },
  { key: 'amaderado', label: 'Amaderado' },
  { key: 'fresco', label: 'Fresco' },
  { key: 'citrico', label: 'Cítrico' },
  { key: 'fougere', label: 'Fougère' },
];

function polarToCartesian(angle, radius, cx, cy) {
  const radian = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radian),
    y: cy + radius * Math.sin(radian),
  };
}

/**
 * @param {Object} props
 * @param {Object} props.data - { floral: 0-100, oriental: 0-100, ... }
 * @param {number} [props.size=200] - Tamaño del gráfico
 * @param {Array} [props.axes] - Ejes personalizados [{key, label}]
 * @param {string} [props.fillColor] - Color del área
 * @param {string} [props.strokeColor] - Color del borde
 */
export default function RadarChart({
  data = {},
  size = 200,
  axes = DEFAULT_AXES,
  fillColor = 'rgba(212,175,55,0.2)',
  strokeColor = '#D4AF37',
  title,
}) {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.35;
  const labelRadius = size * 0.45;
  const numAxes = axes.length;
  const angleStep = 360 / numAxes;

  // Niveles de la grilla (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Calcular puntos del polígono de datos
  const dataPoints = axes.map((axis, i) => {
    const value = Math.min(100, Math.max(0, data[axis.key] || 0)) / 100;
    const angle = angleStep * i;
    return polarToCartesian(angle, maxRadius * value, cx, cy);
  });
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Puntos de las etiquetas
  const labelPoints = axes.map((axis, i) => {
    const angle = angleStep * i;
    return polarToCartesian(angle, labelRadius, cx, cy);
  });

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grilla concéntrica */}
        {gridLevels.map((level) => {
          const gridPoints = axes.map((_, i) => {
            const angle = angleStep * i;
            return polarToCartesian(angle, maxRadius * level, cx, cy);
          });
          const polygon = gridPoints.map((p) => `${p.x},${p.y}`).join(' ');
          return (
            <Polygon
              key={`grid-${level}`}
              points={polygon}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Líneas de eje */}
        {axes.map((_, i) => {
          const angle = angleStep * i;
          const end = polarToCartesian(angle, maxRadius, cx, cy);
          return (
            <Line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Punto central */}
        <Circle cx={cx} cy={cy} r={2} fill="rgba(255,255,255,0.2)" />

        {/* Polígono de datos */}
        {dataPolygon && (
          <Polygon
            points={dataPolygon}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={1.5}
          />
        )}

        {/* Puntos de datos */}
        {dataPoints.map((p, i) => (
          <Circle
            key={`dot-${i}`}
            cx={p.x}
            cy={p.y}
            r={3}
            fill={strokeColor}
          />
        ))}

        {/* Etiquetas */}
        {axes.map((axis, i) => {
          const lp = labelPoints[i];
          const value = data[axis.key] || 0;
          return (
            <SvgText
              key={`label-${i}`}
              x={lp.x}
              y={lp.y}
              fill="rgba(255,255,255,0.6)"
              fontSize={8}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {axis.label} ({value})
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  title: {
    color: THEME.colors.gold,
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 8,
    textAlign: 'center',
  },
});
