// Central icon configuration using React Icons
// This file exports commonly used icons from the react-icons library
// Icons are sourced from Font Awesome, Material Design Icons, and Bootstrap Icons

import {
  // Font Awesome Icons (FaIcons)
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaCalendarAlt,
  FaPills,
  FaHospital,
  FaCog,
  FaBell,
  FaHeartbeat,
  FaAppleAlt,
  FaDumbbell,
  FaBook,
  FaRobot,
  FaClipboard,
  FaBirthdayCake,
  FaChartBar,
  FaChartLine,
  FaPlus,
  FaTrash,
  FaDownload,
  FaSearch,
  FaSignOut,
  FaFileAlt,
  FaFileUpload,
  FaTint,
  FaWalking,
  FaClock,
  FaHeart,
  FaWeight,
  FaRulerVertical,
  FaTachometerAlt,
  FaVials,
  FaFlask,
  FaBriefcaseMedical,
  FaXRay,
  FaInfinity,
  FaMagnet,
  FaWarning,
  FaNotesMedical,
  FaArrowUp,
  FaArrowDown,
  FaBan,
} from 'react-icons/fa';

import {
  // Material Design Icons (MdIcons)
  MdMedicalServices,
  MdHealthAndSafety,
  MdFitnesCenter,
  MdMenuBook,
  MdAssignmentInd,
} from 'react-icons/md';

// Central icon mapping for easy access throughout the app
export const ICONS = {
  // Auth & Profile
  user: FaUser,
  email: FaEnvelope,
  password: FaLock,
  eye: FaEye,
  eyeSlash: FaEyeSlash,

  // General
  checkmark: FaCheckCircle,
  calendar: FaCalendarAlt,
  settings: FaCog,
  bell: FaBell,
  search: FaSearch,
  trash: FaTrash,
  download: FaDownload,
  signOut: FaSignOut,
  plus: FaPlus,
  clock: FaClock,
  warning: FaWarning,

  // Health & Medical
  heart: FaHeartbeat,
  heartFilled: FaHeart,
  pills: FaPills,
  hospital: FaHospital,
  stethoscope: FaBriefcaseMedical,
  medical: MdMedicalServices,
  healthSafety: MdHealthAndSafety,
  blood: FaVials,
  flask: FaFlask,
  xray: FaXRay,
  mri: FaMagnet,
  ultrasound: FaInfinity,
  clipboard: FaClipboard,
  fileAlt: FaFileAlt,
  fileUpload: FaFileUpload,
  notes: FaNotesMedical,

  // Vitals & Measurements
  blood_pressure: FaTachometerAlt,
  weight: FaWeight,
  height: FaRulerVertical,

  // Lifestyle & Fitness
  fitness: FaDumbbell,
  apple: FaAppleAlt,
  water: FaTint,
  steps: FaWalking,
  robot: FaRobot,
  fitnessMaterial: MdFitnesCenter,

  // Navigation & Sections
  book: FaBook,
  menu: FaBook,
  learning: MdMenuBook,
  profile: FaAssignmentInd,

  // UI Elements
  arrowUp: FaArrowUp,
  arrowDown: FaArrowDown,
  ban: FaBan,

  // Charts & Data
  chart: FaChartBar,
  trend: FaChartLine,
};

// Icon size presets for consistency
export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 40,
};

// Color presets for icons
export const ICON_COLORS = {
  primary: '#1dbf73',
  secondary: '#6b7280',
  danger: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  info: '#3b82f6',
  white: '#ffffff',
  text: '#1f2937',
};

// Utility function to render icons
export const IconComponent = ({ name, size = 'md', color = 'text' }) => {
  const Icon = ICONS[name];
  if (!Icon) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  return (
    <Icon
      size={ICON_SIZES[size] || size}
      color={ICON_COLORS[color] || color}
    />
  );
};

export default ICONS;
