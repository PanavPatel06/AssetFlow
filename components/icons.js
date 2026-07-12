// Central icon set for AssetFlow.
//
// We use Phosphor Icons (a refined, editorial-feeling set) instead of the very
// common default pack, and re-export them under the friendly names the app
// already uses — so swapping the icon library only touches this one file.
//
// Imported from the SSR-safe entry so the icons work in both server and client
// components. Default weight is "regular" for a clean 1.5px-stroke look.

export {
  Warning as AlertTriangle,
  ArrowLeft,
  ArrowsLeftRight as ArrowLeftRight,
  ArrowRight,
  Prohibit as Ban,
  Bell,
  Stack as Boxes,
  Buildings as Building2,
  CalendarDots as CalendarClock,
  Check,
  Checks as CheckCheck,
  CheckCircle as CheckCircle2,
  CaretDown as ChevronDown,
  ClipboardText as ClipboardCheck,
  SquaresFour as LayoutDashboard,
  ChartBar as BarChart3,
  DownloadSimple as Download,
  DotsSixVertical as GripVertical,
  Info,
  Lock,
  EnvelopeSimple as MailCheck,
  List as Menu,
  Package as PackageCheck,
  Cube as PackageOpen,
  Paperclip,
  Plus,
  MagnifyingGlass as Search,
  ShieldWarning as ShieldAlert,
  ShieldCheck,
  TrendUp as TrendingUp,
  ArrowUUpLeft as Undo2,
  UploadSimple as Upload,
  UserSwitch as UserCog,
  Wrench,
  X,
  XCircle,
} from "@phosphor-icons/react/dist/ssr";
