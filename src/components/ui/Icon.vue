<template>
  <!-- Mode slot: permet d'utiliser un SVG personnalisé directement -->
  <span v-if="$slots.default" class="inline-flex" :style="{ width: `${size}px`, height: `${size}px` }">
    <slot></slot>
  </span>
  <!-- Mode svg: permet de passer un SVG en string -->
  <span v-else-if="svg" class="inline-flex" :class="className" :style="{ width: `${size}px`, height: `${size}px` }"
    v-html="processedSvg"></span>
  <!-- Mode icône prédéfinie -->
  <component :is="iconComponent" v-else-if="iconComponent" :width="size" :height="size" :class="className" />
</template>

<script setup>
import { computed, h } from 'vue'

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  size: {
    type: [Number, String],
    default: 18,
  },
  className: {
    type: String,
    default: '',
  },
  // Permet de passer un SVG en string (copié depuis Heroicons, etc.)
  svg: {
    type: String,
    default: '',
  },
})

// Traite le SVG string pour adapter la taille
const processedSvg = computed(() => {
  if (!props.svg) return ''
  // Remplace les attributs width et height du SVG
  return props.svg
    .replace(/width="[^"]*"/g, `width="${props.size}"`)
    .replace(/height="[^"]*"/g, `height="${props.size}"`)
    .replace(/<svg/, `<svg style="width: ${props.size}px; height: ${props.size}px"`)
})

const icons = {
  LayoutDashboard: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'rect', attrs: { width: '7', height: '9', x: '3', y: '3', rx: '1' } },
      { type: 'rect', attrs: { width: '7', height: '5', x: '14', y: '3', rx: '1' } },
      { type: 'rect', attrs: { width: '7', height: '9', x: '14', y: '12', rx: '1' } },
      { type: 'rect', attrs: { width: '7', height: '5', x: '3', y: '16', rx: '1' } },
    ],
  },
  Briefcase: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' } },
      { type: 'rect', attrs: { width: '20', height: '14', x: '2', y: '6', rx: '2' } },
    ],
  },
  Building2: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z' } },
      { type: 'path', attrs: { d: 'M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2' } },
      { type: 'path', attrs: { d: 'M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2' } },
      { type: 'path', attrs: { d: 'M10 6h4' } },
      { type: 'path', attrs: { d: 'M10 10h4' } },
      { type: 'path', attrs: { d: 'M10 14h4' } },
      { type: 'path', attrs: { d: 'M10 18h4' } },
    ],
  },
  MessageSquare: {
    viewBox: '0 0 24 24',
    paths: [
      {
        type: 'path',
        attrs: { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
      },
    ],
  },
  ShieldAlert: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10' } },
      { type: 'path', attrs: { d: 'M12 8v4' } },
      { type: 'path', attrs: { d: 'M12 16h.01' } },
    ],
  },
  Search: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'circle', attrs: { cx: '11', cy: '11', r: '8' } },
      { type: 'path', attrs: { d: 'm21 21-4.3-4.3' } },
    ],
  },
  Bell: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9' } },
      { type: 'path', attrs: { d: 'M10.3 21a1.94 1.94 0 0 0 3.4 0' } },
    ],
  },
  LogOut: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' } },
      { type: 'polyline', attrs: { points: '16 17 21 12 16 7' } },
      { type: 'line', attrs: { x1: '21', x2: '9', y1: '12', y2: '12' } },
    ],
  },
  PlusCircle: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'circle', attrs: { cx: '12', cy: '12', r: '10' } },
      { type: 'path', attrs: { d: 'M8 12h8' } },
      { type: 'path', attrs: { d: 'M12 8v8' } },
    ],
  },
  User: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' } },
      { type: 'circle', attrs: { cx: '12', cy: '7', r: '4' } },
    ],
  },
  CheckCircle: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' } },
      { type: 'path', attrs: { d: 'm9 11 3 3L22 4' } },
    ],
  },
  Check: {
    viewBox: '0 0 24 24',
    paths: [{ type: 'path', attrs: { d: 'M20 6 9 17l-5-5' } }],
  },
  CheckCheck: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M18 6 7 17l-5-5' } },
      { type: 'path', attrs: { d: 'm22 10-7.5 7.5L13 16' } },
    ],
  },
  ArrowLeft: {
    viewBox: '0 0 24 24',
    paths: [{ type: 'path', attrs: { d: 'm12 19-7-7 7-7' } }, { type: 'path', attrs: { d: 'M19 12H5' } }],
  },
  MapPin: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' } },
      { type: 'circle', attrs: { cx: '12', cy: '10', r: '3' } },
    ],
  },
  Filter: {
    viewBox: '0 0 24 24',
    paths: [{ type: 'polygon', attrs: { points: '22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' } }],
  },
  XCircle: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'circle', attrs: { cx: '12', cy: '12', r: '10' } },
      { type: 'path', attrs: { d: 'm15 9-6 6' } },
      { type: 'path', attrs: { d: 'm9 9 6 6' } },
    ],
  },
  TrendingUp: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'polyline', attrs: { points: '22 7 13.5 15.5 8.5 10.5 2 17' } },
      { type: 'polyline', attrs: { points: '16 7 22 7 22 13' } },
    ],
  },
  Users: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' } },
      { type: 'circle', attrs: { cx: '9', cy: '7', r: '4' } },
      { type: 'path', attrs: { d: 'M22 21v-2a4 4 0 0 0-3-3.87' } },
      { type: 'path', attrs: { d: 'M16 3.13a4 4 0 0 1 0 7.75' } },
    ],
  },
  FileText: {
    viewBox: '0 0 24 24',
    paths: [
      {
        type: 'path',
        attrs: { d: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' },
      },
      { type: 'polyline', attrs: { points: '14 2 14 8 20 8' } },
      { type: 'line', attrs: { x1: '16', x2: '8', y1: '13', y2: '13' } },
      { type: 'line', attrs: { x1: '16', x2: '8', y1: '17', y2: '17' } },
      { type: 'line', attrs: { x1: '10', x2: '8', y1: '9', y2: '9' } },
    ],
  },
  Send: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'm22 2-7 20-4-9-9-4Z' } },
      { type: 'path', attrs: { d: 'M22 2 11 13' } },
    ],
  },
  Heart: {
    viewBox: '0 0 24 24',
    paths: [
      {
        type: 'path',
        attrs: {
          d: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
        },
      },
    ],
  },
  Bookmark: {
    viewBox: '0 0 24 24',
    paths: [{ type: 'path', attrs: { d: 'm19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z' } }],
  },
  Calendar: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'rect', attrs: { width: '18', height: '18', x: '3', y: '4', rx: '2', ry: '2' } },
      { type: 'line', attrs: { x1: '16', x2: '16', y1: '2', y2: '6' } },
      { type: 'line', attrs: { x1: '8', x2: '8', y1: '2', y2: '6' } },
      { type: 'line', attrs: { x1: '3', x2: '21', y1: '10', y2: '10' } },
    ],
  },
  Eye: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' } },
      { type: 'circle', attrs: { cx: '12', cy: '12', r: '3' } },
    ],
  },
  AlertCircle: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'circle', attrs: { cx: '12', cy: '12', r: '10' } },
      { type: 'line', attrs: { x1: '12', x2: '12', y1: '8', y2: '12' } },
      { type: 'line', attrs: { x1: '12', x2: '12.01', y1: '16', y2: '16' } },
    ],
  },
  ChevronRight: {
    viewBox: '0 0 24 24',
    paths: [{ type: 'path', attrs: { d: 'm9 18 6-6-6-6' } }],
  },
  ChevronDown: {
    viewBox: '0 0 24 24',
    paths: [{ type: 'path', attrs: { d: 'm6 9 6 6 6-6' } }],
  },
  ChevronLeft: {
    viewBox: '0 0 24 24',
    paths: [{ type: 'path', attrs: { d: 'm15 18-6-6 6-6' } }],
  },
  X: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M18 6 6 18' } },
      { type: 'path', attrs: { d: 'm6 6 12 12' } },
    ],
  },
  Mail: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'rect', attrs: { width: '20', height: '16', x: '2', y: '4', rx: '2' } },
      { type: 'path', attrs: { d: 'm2 7 8.97 5.7a1.94 1.94 0 0 0 2.06 0L22 7' } },
    ],
  },
  LayoutGrid: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'rect', attrs: { width: '7', height: '7', x: '3', y: '3', rx: '1' } },
      { type: 'rect', attrs: { width: '7', height: '7', x: '14', y: '3', rx: '1' } },
      { type: 'rect', attrs: { width: '7', height: '7', x: '14', y: '14', rx: '1' } },
      { type: 'rect', attrs: { width: '7', height: '7', x: '3', y: '14', rx: '1' } },
    ],
  },
  List: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'line', attrs: { x1: '8', x2: '21', y1: '6', y2: '6' } },
      { type: 'line', attrs: { x1: '8', x2: '21', y1: '12', y2: '12' } },
      { type: 'line', attrs: { x1: '8', x2: '21', y1: '18', y2: '18' } },
      { type: 'line', attrs: { x1: '3', x2: '3.01', y1: '6', y2: '6' } },
      { type: 'line', attrs: { x1: '3', x2: '3.01', y1: '12', y2: '12' } },
      { type: 'line', attrs: { x1: '3', x2: '3.01', y1: '18', y2: '18' } },
    ],
  },
  Info: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'circle', attrs: { cx: '12', cy: '12', r: '10' } },
      { type: 'path', attrs: { d: 'M12 16v-4' } },
      { type: 'path', attrs: { d: 'M12 8h.01' } },
    ],
  },
  Globe: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'circle', attrs: { cx: '12', cy: '12', r: '10' } },
      { type: 'path', attrs: { d: 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20' } },
      { type: 'path', attrs: { d: 'M2 12h20' } },
    ],
  },
  Share: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8' } },
      { type: 'polyline', attrs: { points: '16 6 12 2 8 6' } },
      { type: 'line', attrs: { x1: '12', x2: '12', y1: '2', y2: '15' } },
    ],
  },
  UserPlus: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' } },
      { type: 'circle', attrs: { cx: '9', cy: '7', r: '4' } },
      { type: 'line', attrs: { x1: '19', x2: '19', y1: '8', y2: '14' } },
      { type: 'line', attrs: { x1: '22', x2: '16', y1: '11', y2: '11' } },
    ],
  },
  Edit: {
    viewBox: '0 0 24 24',
    paths: [
      {
        type: 'path',
        attrs: {
          d: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
        },
      },
      { type: 'path', attrs: { d: 'm15 5 4 4' } },
    ],
  },
  Phone: {
    viewBox: '0 0 24 24',
    paths: [
      {
        type: 'path',
        attrs: {
          d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
        },
      },
    ],
  },
  MoreVertical: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'circle', attrs: { cx: '12', cy: '12', r: '1' } },
      { type: 'circle', attrs: { cx: '12', cy: '5', r: '1' } },
      { type: 'circle', attrs: { cx: '12', cy: '19', r: '1' } },
    ],
  },
  Image: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'rect', attrs: { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' } },
      { type: 'circle', attrs: { cx: '9', cy: '9', r: '2' } },
      { type: 'path', attrs: { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' } },
    ],
  },
  Images: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M18 22H4a2 2 0 0 1-2-2V6' } },
      { type: 'path', attrs: { d: 'm22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18' } },
      { type: 'circle', attrs: { cx: '12', cy: '8', r: '2' } },
      { type: 'rect', attrs: { width: '16', height: '16', x: '6', y: '2', rx: '2' } },
    ],
  },
  Trash: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M3 6h18' } },
      { type: 'path', attrs: { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' } },
      { type: 'path', attrs: { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' } },
      { type: 'line', attrs: { x1: '10', x2: '10', y1: '11', y2: '17' } },
      { type: 'line', attrs: { x1: '14', x2: '14', y1: '11', y2: '17' } },
    ],
  },
  Flag: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z' } },
      { type: 'line', attrs: { x1: '4', x2: '4', y1: '22', y2: '15' } },
    ],
  },
  MessageCircle: {
    viewBox: '0 0 24 24',
    paths: [{ type: 'path', attrs: { d: 'M7.9 20A9 9 0 1 0 4 16.1L2 22Z' } }],
  },
  Reply: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'polyline', attrs: { points: '9 17 4 12 9 7' } },
      { type: 'path', attrs: { d: 'M20 18v-2a4 4 0 0 0-4-4H4' } },
    ],
  },
  Clock: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'circle', attrs: { cx: '12', cy: '12', r: '10' } },
      { type: 'polyline', attrs: { points: '12 6 12 12 16 14' } },
    ],
  },
  Timer: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'line', attrs: { x1: '10', x2: '14', y1: '2', y2: '2' } },
      { type: 'line', attrs: { x1: '12', x2: '15', y1: '14', y2: '11' } },
      { type: 'circle', attrs: { cx: '12', cy: '14', r: '8' } },
    ],
  },
  BarChart: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'line', attrs: { x1: '12', x2: '12', y1: '20', y2: '10' } },
      { type: 'line', attrs: { x1: '18', x2: '18', y1: '20', y2: '4' } },
      { type: 'line', attrs: { x1: '6', x2: '6', y1: '20', y2: '16' } },
    ],
  },
  ClipboardList: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'rect', attrs: { width: '8', height: '4', x: '8', y: '2', rx: '1', ry: '1' } },
      {
        type: 'path',
        attrs: { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' },
      },
      { type: 'path', attrs: { d: 'M12 11h4' } },
      { type: 'path', attrs: { d: 'M12 16h4' } },
      { type: 'path', attrs: { d: 'M8 11h.01' } },
      { type: 'path', attrs: { d: 'M8 16h.01' } },
    ],
  },
  Plus: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M5 12h14' } },
      { type: 'path', attrs: { d: 'M12 5v14' } },
    ],
  },
  UserX: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' } },
      { type: 'circle', attrs: { cx: '9', cy: '7', r: '4' } },
      { type: 'line', attrs: { x1: '17', x2: '22', y1: '8', y2: '13' } },
      { type: 'line', attrs: { x1: '22', x2: '17', y1: '8', y2: '13' } },
    ],
  },
  Rocket: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z' } },
      { type: 'path', attrs: { d: 'm12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z' } },
      { type: 'path', attrs: { d: 'M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0' } },
      { type: 'path', attrs: { d: 'M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5' } },
    ],
  },
  Circle: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'circle', attrs: { cx: '12', cy: '12', r: '10' } },
    ],
  },
  Lock: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'rect', attrs: { width: '18', height: '11', x: '3', y: '11', rx: '2', ry: '2' } },
      { type: 'path', attrs: { d: 'M7 11V7a5 5 0 0 1 10 0v4' } },
    ],
  },
  Award: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'circle', attrs: { cx: '12', cy: '8', r: '7' } },
      { type: 'polyline', attrs: { points: '8.21 13.89 7 23 12 20 17 23 15.79 13.88' } },
    ],
  },
  ArrowRight: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M5 12h14' } },
      { type: 'path', attrs: { d: 'm12 5 7 7-7 7' } },
    ],
  },
  AlertTriangle: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' } },
      { type: 'path', attrs: { d: 'M12 9v4' } },
      { type: 'path', attrs: { d: 'M12 17h.01' } },
    ],
  },
  Building: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'rect', attrs: { width: '16', height: '20', x: '4', y: '2', rx: '2', ry: '2' } },
      { type: 'path', attrs: { d: 'M9 22v-4h6v4' } },
      { type: 'path', attrs: { d: 'M8 6h.01' } },
      { type: 'path', attrs: { d: 'M16 6h.01' } },
      { type: 'path', attrs: { d: 'M12 6h.01' } },
      { type: 'path', attrs: { d: 'M12 10h.01' } },
      { type: 'path', attrs: { d: 'M12 14h.01' } },
      { type: 'path', attrs: { d: 'M16 10h.01' } },
      { type: 'path', attrs: { d: 'M16 14h.01' } },
      { type: 'path', attrs: { d: 'M8 10h.01' } },
      { type: 'path', attrs: { d: 'M8 14h.01' } },
    ],
  },
  ExternalLink: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' } },
      { type: 'polyline', attrs: { points: '15 3 21 3 21 9' } },
      { type: 'line', attrs: { x1: '10', x2: '21', y1: '14', y2: '3' } },
    ],
  },
  FileCheck: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' } },
      { type: 'path', attrs: { d: 'M14 2v4a2 2 0 0 0 2 2h4' } },
      { type: 'path', attrs: { d: 'm9 15 2 2 4-4' } },
    ],
  },
  RefreshCw: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' } },
      { type: 'path', attrs: { d: 'M21 3v5h-5' } },
      { type: 'path', attrs: { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' } },
      { type: 'path', attrs: { d: 'M8 16H3v5' } },
    ],
  },
  ChevronUp: {
    viewBox: '0 0 24 24',
    paths: [{ type: 'path', attrs: { d: 'm18 15-6-6-6 6' } }],
  },
  BarChart2: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'line', attrs: { x1: '18', x2: '18', y1: '20', y2: '10' } },
      { type: 'line', attrs: { x1: '12', x2: '12', y1: '20', y2: '4' } },
      { type: 'line', attrs: { x1: '6', x2: '6', y1: '20', y2: '14' } },
    ],
  },
  Megaphone: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'm3 11 18-5v12L3 13v-2z' } },
      { type: 'path', attrs: { d: 'M11.6 16.8a3 3 0 1 1-5.8-1.6' } },
    ],
  },
  Video: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'm22 8-6 4 6 4V8Z' } },
      { type: 'rect', attrs: { width: '14', height: '12', x: '2', y: '6', rx: '2', ry: '2' } },
    ],
  },
  Trash2: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M3 6h18' } },
      { type: 'path', attrs: { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' } },
      { type: 'path', attrs: { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' } },
      { type: 'line', attrs: { x1: '10', x2: '10', y1: '11', y2: '17' } },
      { type: 'line', attrs: { x1: '14', x2: '14', y1: '11', y2: '17' } },
    ],
  },
  Paperclip: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'm21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48' } },
    ],
  },
  Smile: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'circle', attrs: { cx: '12', cy: '12', r: '10' } },
      { type: 'path', attrs: { d: 'M8 14s1.5 2 4 2 4-2 4-2' } },
      { type: 'line', attrs: { x1: '9', x2: '9.01', y1: '9', y2: '9' } },
      { type: 'line', attrs: { x1: '15', x2: '15.01', y1: '9', y2: '9' } },
    ],
  },
  Download: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' } },
      { type: 'polyline', attrs: { points: '7 10 12 15 17 10' } },
      { type: 'line', attrs: { x1: '12', x2: '12', y1: '15', y2: '3' } },
    ],
  },
  Monitor: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'rect', attrs: { width: '20', height: '14', x: '2', y: '3', rx: '2' } },
      { type: 'line', attrs: { x1: '8', x2: '16', y1: '21', y2: '21' } },
      { type: 'line', attrs: { x1: '12', x2: '12', y1: '17', y2: '21' } },
    ],
  },
  Shield: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10' } },
    ],
  },
  CalendarX: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'rect', attrs: { width: '18', height: '18', x: '3', y: '4', rx: '2', ry: '2' } },
      { type: 'line', attrs: { x1: '16', x2: '16', y1: '2', y2: '6' } },
      { type: 'line', attrs: { x1: '8', x2: '8', y1: '2', y2: '6' } },
      { type: 'line', attrs: { x1: '3', x2: '21', y1: '10', y2: '10' } },
      { type: 'line', attrs: { x1: '10', x2: '14', y1: '14', y2: '18' } },
      { type: 'line', attrs: { x1: '14', x2: '10', y1: '14', y2: '18' } },
    ],
  },
  Ban: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'circle', attrs: { cx: '12', cy: '12', r: '10' } },
      { type: 'path', attrs: { d: 'm4.9 4.9 14.2 14.2' } },
    ],
  },
  UserCog: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'circle', attrs: { cx: '18', cy: '15', r: '3' } },
      { type: 'circle', attrs: { cx: '9', cy: '7', r: '4' } },
      { type: 'path', attrs: { d: 'M10 15H6a4 4 0 0 0-4 4v2' } },
      { type: 'path', attrs: { d: 'm21.7 16.4-.9-.3' } },
      { type: 'path', attrs: { d: 'm15.2 13.9-.9-.3' } },
      { type: 'path', attrs: { d: 'm16.6 18.7.3-.9' } },
      { type: 'path', attrs: { d: 'm19.1 12.2.3-.9' } },
      { type: 'path', attrs: { d: 'm19.6 18.7-.4-1' } },
      { type: 'path', attrs: { d: 'm16.8 12.3-.4-1' } },
      { type: 'path', attrs: { d: 'm14.3 16.6 1-.4' } },
      { type: 'path', attrs: { d: 'm20.7 13.8 1-.4' } },
    ],
  },
  Tag: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z' } },
      { type: 'circle', attrs: { cx: '7.5', cy: '7.5', r: '.5', fill: 'currentColor' } },
    ],
  },
  Loader2: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M21 12a9 9 0 1 1-6.219-8.56' } },
    ],
  },
  SearchX: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'm13.5 8.5-5 5' } },
      { type: 'path', attrs: { d: 'm8.5 8.5 5 5' } },
      { type: 'circle', attrs: { cx: '11', cy: '11', r: '8' } },
      { type: 'path', attrs: { d: 'm21 21-4.3-4.3' } },
    ],
  },
  Crown: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z' } },
      { type: 'path', attrs: { d: 'M5 21h14' } },
    ],
  },
  BellOff: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5' } },
      { type: 'path', attrs: { d: 'M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7' } },
      { type: 'path', attrs: { d: 'M10.3 21a1.94 1.94 0 0 0 3.4 0' } },
      { type: 'path', attrs: { d: 'm2 2 20 20' } },
    ],
  },
  Zap: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'polygon', attrs: { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' } },
    ],
  },
  UsersGroup: {
    viewBox: '0 0 24 24',
    paths: [
      { type: 'path', attrs: { d: 'M18 21a8 8 0 0 0-16 0' } },
      { type: 'circle', attrs: { cx: '10', cy: '8', r: '5' } },
      { type: 'path', attrs: { d: 'M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3' } },
    ],
  },
}

const createSvgElement = (iconData) => {
  const children = iconData.paths.map((item) => {
    return h(item.type, {
      ...item.attrs,
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    })
  })

  return h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: props.size,
      height: props.size,
      viewBox: iconData.viewBox,
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: props.className,
    },
    children,
  )
}

const iconComponent = computed(() => {
  const iconData = icons[props.name]
  if (!iconData) return null
  return createSvgElement(iconData)
})
</script>
